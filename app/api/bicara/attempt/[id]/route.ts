export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attempt = await prisma.speakingAttempt.findUnique({
      where: { id: params.id },
      include: {
        topic: true,
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Hasil latihan tidak ditemukan." },
        { status: 404 }
      );
    }

    // Participants can only view their own attempts
    if (user.role !== "SUPER_ADMIN" && attempt.userId !== user.id) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    return NextResponse.json({ attempt });
  } catch (error) {
    console.error("Error fetching attempt:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data latihan." },
      { status: 500 }
    );
  }
}
