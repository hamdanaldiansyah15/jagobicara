import { CourseGrantSource, Prisma } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { getCurrentSeasonKey, getSeasonLeaderboardSnapshot } from "@/lib/leaderboard/calculator";
import { getOrCreateCertificateTemplate, reserveCertificateNumber } from "@/lib/certificate/templates";

export async function hasCourseAccess(userId: string, courseId: string) {
  const course = await prisma.learningCourse.findUnique({ where: { id: courseId } });
  if (!course || !course.isActive) return false;
  if (course.accessMode === "FREE") return true;

  const now = new Date();
  const activeGrant = await prisma.courseAccessGrant.findFirst({
    where: {
      userId,
      courseId,
      revokedAt: null,
      startsAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  });
  if (activeGrant) return true;

  if (course.accessMode === "COMMUNITY") {
    const membership = await prisma.communityMember.findFirst({ where: { userId } });
    if (membership) return true;
  }

  if (course.leaderboardReward) {
    const seasonKey = getCurrentSeasonKey();
    const rewardKey = `leaderboard:${course.id}:${seasonKey}:${userId}`;
    const existingReward = await prisma.courseAccessGrant.findUnique({ where: { sourceKey: rewardKey } });
    if (existingReward) {
      return existingReward.revokedAt === null &&
        existingReward.startsAt <= now &&
        (!existingReward.expiresAt || existingReward.expiresAt > now);
    }

    const leaderboard = await getSeasonLeaderboardSnapshot({ seasonKey });
    const rank = leaderboard.find((entry) => entry.userId === userId)?.rank;
    if (rank && rank <= 3) {
      const reward = await prisma.courseAccessGrant.create({
        data: {
          userId,
          courseId,
          source: CourseGrantSource.LEADERBOARD,
          sourceKey: rewardKey,
          startsAt: now,
          expiresAt: new Date(now.getTime() + course.rewardDurationDays * 24 * 60 * 60 * 1000),
        },
      });
      return reward.expiresAt! > now;
    }
  }

  return false;
}

export async function issueCourseCertificateIfEligible(userId: string, courseId: string) {
  const course = await prisma.learningCourse.findUnique({
    where: { id: courseId },
    include: { modules: { select: { id: true } } },
  });
  if (!course?.certificateEnabled || course.modules.length === 0) return null;

  const completedCount = await prisma.moduleProgress.count({
    where: {
      userId,
      isCompleted: true,
      quizScore: 10,
      moduleId: { in: course.modules.map((module) => module.id) },
    },
  });
  if (completedCount < course.modules.length) return null;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  if (!user) return null;

  const existing = await prisma.courseCertificate.findUnique({ where: { userId_courseId: { userId, courseId } } });
  if (existing) return existing;

  const template = await getOrCreateCertificateTemplate(courseId, course.title);
  const issueDate = new Date();
  try {
    return await prisma.$transaction(async (transaction) => {
      const alreadyIssued = await transaction.courseCertificate.findUnique({ where: { userId_courseId: { userId, courseId } } });
      if (alreadyIssued) return alreadyIssued;

      const certificateNumber = await reserveCertificateNumber(transaction, template.scopeKey, template.courseCode, issueDate);
      return transaction.courseCertificate.create({
        data: {
          certificateNumber,
          userId,
          courseId,
          recipientName: user.name,
          recipientMessage: template.recipientMessage,
          gradientStart: template.gradientStart,
          gradientEnd: template.gradientEnd,
          issueDate,
          signatureName: template.signatureName,
          signatureRole: template.signatureRole,
        },
      });
    });
  } catch (cause) {
    if (cause instanceof Prisma.PrismaClientKnownRequestError && cause.code === "P2002") {
      return prisma.courseCertificate.findUnique({ where: { userId_courseId: { userId, courseId } } });
    }
    throw cause;
  }
}
