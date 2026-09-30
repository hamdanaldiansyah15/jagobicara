export const dynamic = "force-dynamic";

import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

const courseSchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(1000),
  accessMode: z.enum(["FREE", "COMMUNITY", "REDEEM_CODE"]),
  leaderboardReward: z.boolean().default(false),
  rewardDurationDays: z.coerce.number().int().min(1).max(365).default(30),
  certificateEnabled: z.boolean().default(true),
  codeMaxRedemptions: z.coerce.number().int().min(1).max(10000).default(1),
  codeDurationDays: z.union([z.coerce.number().int().min(1).max(3650), z.null()]).optional(),
  codeExpiresAt: z.string().datetime().optional().nullable(),
});

function createRedeemCode() {
  return `JB-${randomBytes(5).toString("hex").toUpperCase()}`;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const courses = await prisma.learningCourse.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        redeemCodes: { orderBy: { createdAt: "desc" } },
        _count: { select: { modules: true } },
      },
    });
    return NextResponse.json({ courses });
  } catch (error) {
    console.error("List learning courses error:", error);
    return NextResponse.json({ error: "Gagal memuat daftar kelas." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Hanya super admin yang dapat membuat kelas." }, { status: 403 });
    }

    const parsed = courseSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data kelas tidak valid." }, { status: 400 });
    }

    const data = parsed.data;
    const result = await prisma.$transaction(async (tx) => {
      const course = await tx.learningCourse.create({
        data: {
          title: data.title,
          description: data.description,
          accessMode: data.accessMode,
          leaderboardReward: data.leaderboardReward,
          rewardDurationDays: data.rewardDurationDays,
          certificateEnabled: data.certificateEnabled,
        },
      });

      let redeemCode: { id: string; code: string; maxRedemptions: number; redemptionCount: number; durationDays: number | null; expiresAt: Date | null; isActive: boolean; createdAt: Date } | null = null;
      if (data.accessMode === "REDEEM_CODE") {
        redeemCode = await tx.courseRedeemCode.create({
          data: {
            code: createRedeemCode(),
            courseId: course.id,
            maxRedemptions: data.codeMaxRedemptions,
            durationDays: data.codeDurationDays ?? null,
            expiresAt: data.codeExpiresAt ? new Date(data.codeExpiresAt) : null,
          },
          select: { id: true, code: true, maxRedemptions: true, redemptionCount: true, durationDays: true, expiresAt: true, isActive: true, createdAt: true },
        });
      }
      return { course, redeemCode };
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    console.error("Create learning course error:", error);
    return NextResponse.json({ error: "Gagal membuat kelas." }, { status: 500 });
  }
}
