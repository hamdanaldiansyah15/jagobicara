"use client";

import { jsPDF } from "jspdf";
import { Download } from "lucide-react";
import logoImage from "@/logo/logojagobicara.png";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CertificateArtwork } from "./CertificateArtwork";

interface CertificateDownloadCardProps {
  certificateId: string;
  certificateType: "PROGRAM" | "COURSE";
  userName: string;
  certificateNumber: string;
  issueDate: Date | string;
  recipientMessage: string;
  gradientStart: string;
  gradientEnd: string;
  signatureName: string;
  signatureRole: string;
  courseTitle?: string;
}

export function CertificateDownloadCard({
  certificateId,
  certificateType,
  userName,
  certificateNumber,
  issueDate,
  recipientMessage,
  gradientStart,
  gradientEnd,
  signatureName,
  signatureRole,
  courseTitle = "Program Jago Bicara",
}: CertificateDownloadCardProps) {
  const handleDownloadPdf = async () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const toRgb = (hex: string) => {
      const value = /^#[0-9A-F]{6}$/i.test(hex) ? hex.slice(1) : "F97316";
      return [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16)) as [number, number, number];
    };
    const start = toRgb(gradientStart);
    const end = toRgb(gradientEnd);
    const topBandHeight = height * 0.095;
    const bottomBandHeight = height * 0.095;
    const layoutScale = height / 502.1;
    const layoutY = (previewY: number) => previewY * layoutScale;
    const textWidth = width * 0.91;

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, width, height, "F");

    const drawGradientBand = (y: number, bandHeight: number) => {
      const steps = 160;
      const bandWidth = width / steps;
      for (let index = 0; index < steps; index += 1) {
        const ratio = index / (steps - 1);
        doc.setFillColor(
          Math.round(start[0] + (end[0] - start[0]) * ratio),
          Math.round(start[1] + (end[1] - start[1]) * ratio),
          Math.round(start[2] + (end[2] - start[2]) * ratio),
        );
        doc.rect(index * bandWidth, y, bandWidth + 0.5, bandHeight, "F");
      }
    };
    drawGradientBand(0, topBandHeight);
    drawGradientBand(height - bottomBandHeight, bottomBandHeight);

    doc.setTextColor(15, 23, 42);
    doc.setFont("times", "bold");
    doc.setFontSize(24 * layoutScale);
    doc.text("SERTIFIKAT", width / 2, layoutY(155.7), { align: "center" });
    doc.setFont("courier", "normal");
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(12 * layoutScale);
    doc.text(`Nomor: ${certificateNumber}`, width / 2, layoutY(176.7), { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12 * layoutScale);
    doc.setTextColor(100, 116, 139);
    doc.text("DIBERIKAN KEPADA:", width / 2, layoutY(197.7), { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(30 * layoutScale);
    const nameLines = doc.splitTextToSize(userName, textWidth);
    doc.setTextColor(15, 23, 42);
    const nameLineHeight = 36 * layoutScale;
    const nameY = layoutY(233.7);
    doc.text(nameLines, width / 2, nameY, { align: "center" });
    const nameExtraHeight = Math.max(0, nameLines.length - 1) * nameLineHeight;

    doc.setFont("helvetica", "normal");
    const messageFontSize = 14 * layoutScale;
    const messageLineHeight = 22.75 * layoutScale;
    doc.setFontSize(messageFontSize);
    doc.setLineHeightFactor(messageLineHeight / messageFontSize);
    doc.setTextColor(51, 65, 85);
    const messageLines = doc.splitTextToSize(recipientMessage, textWidth);
    const messageY = layoutY(265.7) + nameExtraHeight;
    doc.text(messageLines, width / 2, messageY, { align: "center" });
    const messageExtraHeight = Math.max(0, messageLines.length - 1) * messageLineHeight;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16 * layoutScale);
    doc.setTextColor(15, 23, 42);
    const courseLines = doc.splitTextToSize(courseTitle, textWidth);
    const courseExtraHeight = Math.max(0, courseLines.length - 1) * 24 * layoutScale;
    const courseY = layoutY(298.4) + nameExtraHeight + messageExtraHeight;
    doc.text(courseLines, width / 2, courseY, { align: "center" });

    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12 * layoutScale);
    const issueDateY = layoutY(319.4) + nameExtraHeight + messageExtraHeight + courseExtraHeight;
    doc.text(`Tanggal terbit: ${new Date(issueDate).toLocaleDateString("id-ID", { dateStyle: "long" })}`, width / 2, issueDateY, { align: "center" });

    const signatureNameY = issueDateY + 50 * layoutScale;
    const signatureRoleY = signatureNameY + 16 * layoutScale;
    const logoHeight = 36 * layoutScale;
    let logoData: string | null = null;
    try {
      const image = new window.Image();
      image.src = logoImage.src;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      context?.drawImage(image, 0, 0);
      logoData = context ? canvas.toDataURL("image/png") : null;
    } catch {
      logoData = null;
    }

    const logoWidth = 54 * layoutScale;
    const signatureGap = 12 * layoutScale;
    const signerTextMaxWidth = width * 0.42;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14 * layoutScale);
    const signatureNameLines = doc.splitTextToSize(signatureName, signerTextMaxWidth);
    const signatureNameWidth = Math.max(...signatureNameLines.map((line: string) => doc.getTextWidth(line)));
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(12 * layoutScale);
    const signatureRoleLines = doc.splitTextToSize(signatureRole, signerTextMaxWidth);
    const signatureRoleWidth = Math.max(...signatureRoleLines.map((line: string) => doc.getTextWidth(line)));
    const signerTextWidth = Math.max(signatureNameWidth, signatureRoleWidth);
    const signatureGroupWidth = signerTextWidth + (logoData ? logoWidth + signatureGap : 0);
    const signatureGroupX = (width - signatureGroupWidth) / 2;
    const signerTextX = signatureGroupX + (logoData ? logoWidth + signatureGap : 0);
    const signatureLogoY = (signatureNameY + signatureRoleY) / 2 - logoHeight / 2;

    if (logoData) doc.addImage(logoData, "PNG", signatureGroupX, signatureLogoY, logoWidth, logoHeight);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14 * layoutScale);
    doc.text(signatureNameLines, signerTextX, signatureNameY, { align: "left" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(12 * layoutScale);
    doc.text(signatureRoleLines, signerTextX, signatureRoleY, { align: "left" });

    doc.save(`sertifikat-${certificateNumber}.pdf`);
    void fetch("/api/certificates/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certificateId, type: certificateType }),
    }).catch((error) => console.error("Gagal mencatat unduhan sertifikat:", error));
  };

  return (
    <Card className="border-slate-200/80 p-6">
      <div className="p-1">
        <CertificateArtwork
          userName={userName}
          certificateNumber={certificateNumber}
          issueDate={issueDate}
          recipientMessage={recipientMessage}
          gradientStart={gradientStart}
          gradientEnd={gradientEnd}
          signatureName={signatureName}
          signatureRole={signatureRole}
          courseTitle={courseTitle}
        />

        <div className="mt-4 grid gap-3 text-left text-sm text-slate-700 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Nomor Sertifikat</p>
            <p className="mt-1 font-semibold text-slate-900">{certificateNumber}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Tanggal Terbit</p>
            <p className="mt-1 font-semibold text-slate-900">{new Date(issueDate).toLocaleDateString("id-ID")}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={handleDownloadPdf} variant="primary" size="md">
            <Download className="h-4 w-4 mr-2" />
            Unduh PDF
          </Button>
        </div>

      </div>
    </Card>
  );
}
