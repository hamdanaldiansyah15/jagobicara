export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

const templateSchema = z.object({
  scopeKey: z.string().regex(/^(basic-program|course:[A-Za-z0-9_-]+)$/),
  courseCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,10}$/),
  gradientStart: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  gradientEnd: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  recipientMessage: z.string().trim().min(10).max(500),
  signatureName: z.string().trim().min(3).max(100),
  signatureRole: z.string().trim().min(3).max(100),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const parsed = templateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Template tidak valid." }, { status: 400 });
    }

    const data = parsed.data;
    const courseId = data.scopeKey === "basic-program" ? null : data.scopeKey.slice("course:".length);
    if (courseId) {
      const course = await prisma.learningCourse.findFirst({ where: { id: courseId, isActive: true }, select: { id: true } });
      if (!course) return NextResponse.json({ error: "Kelas aktif tidak ditemukan." }, { status: 404 });
    }

    const template = await prisma.certificateTemplate.upsert({
      where: { scopeKey: data.scopeKey },
      create: { ...data, courseId },
      update: {
        courseCode: data.courseCode,
        gradientStart: data.gradientStart.toUpperCase(),
        gradientEnd: data.gradientEnd.toUpperCase(),
        recipientMessage: data.recipientMessage,
        signatureName: data.signatureName,
        signatureRole: data.signatureRole,
      },
    });
    return NextResponse.json({ success: true, template });
  } catch (cause) {
    if (cause && typeof cause === "object" && "code" in cause && cause.code === "P2002") {
      return NextResponse.json({ error: "Kode kelas sertifikat sudah digunakan." }, { status: 409 });
    }
    console.error("Save certificate template error:", cause);
    return NextResponse.json({ error: "Gagal menyimpan template sertifikat." }, { status: 500 });
  }
}