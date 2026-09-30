export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

const downloadSchema = z.object({
  certificateId: z.string().min(1),
  type: z.enum(["PROGRAM", "COURSE"]),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Silakan masuk kembali." }, { status: 401 });

    const parsed = downloadSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Data sertifikat tidak valid." }, { status: 400 });

    const { certificateId, type } = parsed.data;
    const now = new Date();
    if (type === "PROGRAM") {
      const certificate = await prisma.certificate.findUnique({ where: { id: certificateId }, select: { userId: true } });
      if (!certificate || (certificate.userId !== user.id && user.role !== "SUPER_ADMIN")) {
        return NextResponse.json({ error: "Sertifikat tidak ditemukan." }, { status: 404 });
      }
      await prisma.certificate.update({ where: { id: certificateId }, data: { downloadCount: { increment: 1 }, lastDownloadedAt: now } });
    } else {
      const certificate = await prisma.courseCertificate.findUnique({ where: { id: certificateId }, select: { userId: true } });
      if (!certificate || (certificate.userId !== user.id && user.role !== "SUPER_ADMIN")) {
        return NextResponse.json({ error: "Sertifikat tidak ditemukan." }, { status: 404 });
      }
      await prisma.courseCertificate.update({ where: { id: certificateId }, data: { downloadCount: { increment: 1 }, lastDownloadedAt: now } });
    }

    return NextResponse.json({ success: true, downloadedAt: now });
  } catch (cause) {
    console.error("Record certificate download error:", cause);
    return NextResponse.json({ error: "Gagal mencatat unduhan sertifikat." }, { status: 500 });
  }
}