export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json({ error: "Kode komunitas wajib diisi." }, { status: 400 });
    }

    const codeUpper = code.trim().toUpperCase();
    const community = await prisma.community.findUnique({
      where: { code: codeUpper },
    });

    if (!community || community.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `Kode komunitas '${codeUpper}' tidak valid atau komunitas tidak aktif.` },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingMembership = await tx.communityMember.findFirst({
        where: { userId: user.id },
        include: { community: true },
      });

      if (existingMembership) {
        return { alreadyJoined: existingMembership.community.name };
      }

      await tx.communityMember.create({
        data: {
          userId: user.id,
          communityId: community.id,
        },
      });

      return { alreadyJoined: null };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if (result.alreadyJoined) {
      return NextResponse.json(
        { error: `Akun kamu sudah terdaftar di komunitas ${result.alreadyJoined}. Satu akun hanya dapat bergabung dengan satu komunitas.` },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil bergabung dengan ${community.name}!`,
      community: {
        id: community.id,
        name: community.name,
        code: community.code,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return NextResponse.json(
        { error: "Permintaan bergabung bertabrakan dengan perubahan lain. Muat ulang halaman dan coba lagi." },
        { status: 409 }
      );
    }
    console.error("Join community error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat bergabung dengan komunitas." },
      { status: 500 }
    );
  }
}
