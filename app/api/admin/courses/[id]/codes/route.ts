export const dynamic = "force-dynamic";

import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

const codeSchema = z.object({
  maxRedemptions: z.coerce.number().int().min(1).max(10000),
  durationDays: z.union([z.coerce.number().int().min(1).max(3650), z.null()]),
  expiresAt: z.string().datetime().nullable().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const parsed = codeSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Pengaturan kode tidak valid." }, { status: 400 });
    }

    const course = await prisma.learningCourse.findUnique({ where: { id: params.id }, select: { id: true, accessMode: true } });
    if (!course || course.accessMode !== "REDEEM_CODE") {
      return NextResponse.json({ error: "Kelas ini tidak menggunakan kode redeem." }, { status: 400 });
    }

    const code = await prisma.courseRedeemCode.create({
      data: {
        code: `JB-${randomBytes(5).toString("hex").toUpperCase()}`,
        courseId: course.id,
        maxRedemptions: parsed.data.maxRedemptions,
        durationDays: parsed.data.durationDays,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    });
    return NextResponse.json({ success: true, code }, { status: 201 });
  } catch (error) {
    console.error("Create course redeem code error:", error);
    return NextResponse.json({ error: "Gagal membuat kode redeem." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const parsed = z.object({ codeId: z.string().min(1), isActive: z.boolean() }).safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Data perubahan kode tidak valid." }, { status: 400 });

    const code = await prisma.courseRedeemCode.findFirst({ where: { id: parsed.data.codeId, courseId: params.id } });
    if (!code) return NextResponse.json({ error: "Kode redeem tidak ditemukan." }, { status: 404 });

    const updated = await prisma.courseRedeemCode.update({
      where: { id: code.id },
      data: { isActive: parsed.data.isActive },
    });
    return NextResponse.json({ success: true, code: updated });
  } catch (error) {
    console.error("Update course redeem code error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status kode redeem." }, { status: 500 });
  }
}
