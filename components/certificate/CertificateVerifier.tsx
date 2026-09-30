"use client";

import { useState } from "react";
import { CheckCircle2, Search, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface VerifiedCertificate {
  certificateNumber: string;
  recipientName: string;
  issueDate: string;
  courseTitle?: string;
}

export function CertificateVerifier() {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifiedCertificate | null>(null);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!certificateNumber.trim()) {
      setError("Masukkan nomor sertifikat terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/certificates/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateNumber: certificateNumber.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nomor sertifikat tidak valid");
      }

      setResult(data.certificate);
    } catch (err: any) {
      setResult(null);
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200/80 p-5">
      <div className="flex items-center gap-2 text-slate-900">
        <ShieldCheck className="h-5 w-5 text-violet-600" />
        <h2 className="text-lg font-extrabold">Cek Sertifikat</h2>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={certificateNumber}
          onChange={(e) => setCertificateNumber(e.target.value)}
          placeholder="Masukkan nomor sertifikat"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        <Button type="button" onClick={handleVerify} isLoading={loading} variant="primary" className="sm:min-w-[120px]">
          <Search className="h-4 w-4 mr-2" />
          Cek
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-bold">Sertifikat valid</span>
          </div>
          <div className="mt-3 space-y-1 text-sm text-slate-700">
            <p><span className="font-semibold">Nama:</span> {result.recipientName}</p>
            {result.courseTitle && <p><span className="font-semibold">Kelas:</span> {result.courseTitle}</p>}
            <p><span className="font-semibold">Nomor:</span> {result.certificateNumber}</p>
            <p><span className="font-semibold">Tanggal terbit:</span> {new Date(result.issueDate).toLocaleDateString("id-ID")}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
