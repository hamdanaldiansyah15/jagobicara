"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

export function RedeemCourseCodeForm() {
  const router = useRouter();
  const { success, error } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/courses/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Kode tidak dapat ditukarkan.");
      success(`Akses kelas ${data.course.title} berhasil dibuka.`);
      setCode("");
      router.refresh();
    } catch (err) {
      error(err instanceof Error ? err.message : "Terjadi kesalahan saat menukarkan kode.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200/80 p-4 sm:p-5">
      <form id="course-redeem-code" onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="course-redeem-code" className="block text-sm font-extrabold text-slate-900">Punya kode kelas?</label>
          <p className="mt-1 text-xs text-slate-500">Tukarkan kode untuk membuka kelas premium atau materi khusus.</p>
          <input id="course-redeem-code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} required minLength={4} maxLength={40} placeholder="Contoh: JB-4A92F1C8B0" className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary sm:max-w-sm" />
        </div>
        <Button type="submit" variant="primary" isLoading={loading} disabled={!code.trim()}><KeyRound className="mr-2 h-4 w-4" /> Tukarkan kode</Button>
      </form>
    </Card>
  );
}
