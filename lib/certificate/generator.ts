import { Prisma } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { getOrCreateCertificateTemplate, reserveCertificateNumber } from "@/lib/certificate/templates";

export async function checkCertificateEligibility(userId: string): Promise<boolean> {
  const totalModules = await prisma.module.count({ where: { courseId: null } });
  if (totalModules === 0) return false;

  const completedProgress = await prisma.moduleProgress.count({
    where: {
      userId,
      isCompleted: true,
      quizScore: 10,
      module: { courseId: null },
    },
  });

  return completedProgress >= totalModules;
}

export async function issueCertificateIfEligible(userId: string) {
  const existing = await prisma.certificate.findUnique({
    where: { userId },
  });
  if (existing) return existing;

  const isEligible = await checkCertificateEligibility(userId);
  if (!isEligible) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  if (!user) return null;

  const template = await getOrCreateCertificateTemplate(null, "Public Speaking I");
  const issueDate = new Date();
  try {
    return await prisma.$transaction(async (transaction) => {
      const alreadyIssued = await transaction.certificate.findUnique({ where: { userId } });
      if (alreadyIssued) return alreadyIssued;

      const certificateNumber = await reserveCertificateNumber(transaction, template.scopeKey, template.courseCode, issueDate);
      return transaction.certificate.create({
        data: {
          certificateNumber,
          userId,
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
      return prisma.certificate.findUnique({ where: { userId } });
    }
    throw cause;
  }
}

export async function findCertificateByNumber(certificateNumber: string) {
  return prisma.certificate.findUnique({
    where: { certificateNumber },
    include: { user: true },
  });
}
