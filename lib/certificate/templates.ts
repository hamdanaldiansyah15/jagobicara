import type { Prisma } from "@prisma/client";
import prisma from "@/lib/db/prisma";

export const BASIC_CERTIFICATE_SCOPE = "basic-program";
export const DEFAULT_CERTIFICATE_MESSAGE =
  "telah menyelesaikan seluruh materi dan menunjukkan komitmen untuk terus bertumbuh.";
export const DEFAULT_FOUNDER_NAME = "M. Hamdan Aldiansyah, CPS.";
export const DEFAULT_FOUNDER_ROLE = "Founder of Jago Bicara";

export function certificateScopeKey(courseId: string | null) {
  return courseId ? `course:${courseId}` : BASIC_CERTIFICATE_SCOPE;
}

export function defaultCourseCode(title: string) {
  const normalized = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const publicSpeaking = normalized.match(/PUBLIC\s*SPEAKING\s*([IVX]+|\d+)?/);
  if (publicSpeaking) return `PS${publicSpeaking[1] || "I"}`;

  const initials = normalized
    .split(/[^A-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 8);
  return initials || "KELAS";
}

export async function getOrCreateCertificateTemplate(courseId: string | null, courseTitle?: string) {
  const scopeKey = certificateScopeKey(courseId);
  const existing = await prisma.certificateTemplate.findUnique({ where: { scopeKey } });
  if (existing) return existing;

  const existingForCourse = await prisma.certificateTemplate.findFirst({ where: { courseId } });
  if (existingForCourse) {
    return prisma.certificateTemplate.update({
      where: { id: existingForCourse.id },
      data: { scopeKey },
    });
  }

  const title = courseTitle || (courseId
    ? (await prisma.learningCourse.findUnique({ where: { id: courseId }, select: { title: true } }))?.title || "Kelas"
    : "Public Speaking I");
  const baseCode = courseId ? defaultCourseCode(title) : "PSI";
  const conflict = await prisma.certificateTemplate.findUnique({ where: { courseCode: baseCode } });
  const courseCode = conflict && conflict.scopeKey !== scopeKey
    ? `${baseCode.slice(0, 5)}${courseId?.slice(-3).toUpperCase() || "001"}`
    : baseCode;

  return prisma.certificateTemplate.create({
    data: {
      scopeKey,
      courseId,
      courseCode,
    },
  });
}

function getIssueDateCode(issueDate: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).formatToParts(issueDate);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "00";
  return `${part("day")}${part("month")}${part("year")}`;
}

export async function reserveCertificateNumber(
  transaction: Prisma.TransactionClient,
  scopeKey: string,
  courseCode: string,
  issueDate: Date,
) {
  const dateCode = getIssueDateCode(issueDate);
  const sequence = await transaction.certificateSequence.upsert({
    where: { scopeKey_issueDate: { scopeKey, issueDate: dateCode } },
    create: { scopeKey, issueDate: dateCode, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
    select: { lastNumber: true },
  });

  return `JB-${courseCode}-${dateCode}-${String(sequence.lastNumber).padStart(4, "0")}`;
}