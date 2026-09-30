import prisma from "@/lib/db/prisma";
import { hasCourseAccess } from "@/lib/courses/access";

export async function isModuleUnlocked(userId: string, moduleId: string) {
  const moduleItem = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true, order: true, courseId: true },
  });
  if (!moduleItem) return false;
  if (moduleItem.courseId && !(await hasCourseAccess(userId, moduleItem.courseId))) return false;

  const previousModule = await prisma.module.findFirst({
    where: { courseId: moduleItem.courseId, order: { lt: moduleItem.order } },
    orderBy: { order: "desc" },
    select: { id: true },
  });

  if (!previousModule) return true;

  const progress = await prisma.moduleProgress.findUnique({
    where: {
      userId_moduleId: {
        userId,
        moduleId: previousModule.id,
      },
    },
    select: { isCompleted: true },
  });

  return progress?.isCompleted ?? false;
}