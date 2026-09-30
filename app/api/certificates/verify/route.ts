export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { findCertificateByNumber } from "@/lib/certificate/generator";
import prisma from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const certificateNumber = String(body?.certificateNumber || "").trim().toUpperCase();

    if (!certificateNumber) {
      return NextResponse.json({ error: "Nomor sertifikat wajib diisi." }, { status: 400 });
    }

    const certificate = await findCertificateByNumber(certificateNumber);
    if (certificate) {
      return NextResponse.json({
        success: true,
        certificate: {
          certificateNumber: certificate.certificateNumber,
          recipientName: certificate.recipientName,
          issueDate: certificate.issueDate,
          courseTitle: "Public Speaking I · Kelas Basic",
        },
      });
    }

    const courseCertificate = await prisma.courseCertificate.findUnique({
      where: { certificateNumber },
      include: { course: { select: { title: true } } },
    });
    if (!courseCertificate) {
      return NextResponse.json({ error: "Nomor sertifikat tidak ditemukan atau belum valid." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      certificate: {
        certificateNumber: courseCertificate.certificateNumber,
        recipientName: courseCertificate.recipientName,
        issueDate: courseCertificate.issueDate,
        courseTitle: courseCertificate.course.title,
      },
    });
  } catch (error) {
    console.error("Certificate verification error:", error);
    return NextResponse.json({ error: "Gagal memvalidasi sertifikat." }, { status: 500 });
  }
}
