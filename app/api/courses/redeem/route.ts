export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

const redeemSchema = z.object({ code: z.string().trim().min(4).max(40) });

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });

    const parsed = redeemSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Masukkan kode kelas yang valid." }, { status: 400 });

    const code = await prisma.courseRedeemCode.findUnique({
      where: { code: parsed.data.code.toUpperCase() },
      include: { course: true },
    });
    const now = new Date();
    if (!code || !code.isActive || !code.course.isActive || code.course.accessMode !== "REDEEM_CODE") {
      return NextResponse.json({ error: "Kode tidak ditemukan atau sudah dinonaktifkan." }, { status: 404 });
    }
    if (code.expiresAt && code.expiresAt <= now) {
      return NextResponse.json({ error: "Masa berlaku kode sudah berakhir." }, { status: 410 });
    }
    if (code.redemptionCount >= code.maxRedemptions) {
      return NextResponse.json({ error: "Kuota penukaran kode sudah habis." }, { status: 409 });
    }

    const previousGrant = await prisma.courseAccessGrant.findUnique({
      where: { userId_redeemCodeId: { userId: user.id, redeemCodeId: code.id } },
    });
    if (previousGrant) {
      return NextResponse.json({ error: "Kode ini sudah pernah ditukarkan di akunmu." }, { status: 409 });
    }

    const expiresAt = code.durationDays === null
      ? null
      : new Date(now.getTime() + code.durationDays * 24 * 60 * 60 * 1000);

    try {
      await prisma.$transaction(async (tx) => {
        const claimed = await tx.courseRedeemCode.updateMany({
          where: {
            id: code.id,
            isActive: true,
            redemptionCount: { lt: code.maxRedemptions },
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
          data: { redemptionCount: { increment: 1 } },
        });
        if (claimed.count !== 1) throw new Error("CODE_UNAVAILABLE");

        await tx.courseAccessGrant.create({
          data: {
            userId: user.id,
            courseId: code.courseId,
            source: "REDEEM_CODE",
            redeemCodeId: code.id,
            expiresAt,
          },
        });
      });
    } catch (error) {
      if (error instanceof Error && error.message === "CODE_UNAVAILABLE") {
        return NextResponse.json({ error: "Kuota kode baru saja habis. Coba kode lain." }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, course: { id: code.course.id, title: code.course.title }, expiresAt });
  } catch (error) {
    console.error("Redeem course code error:", error);
    return NextResponse.json({ error: "Gagal menukarkan kode kelas." }, { status: 500 });
  }
}
