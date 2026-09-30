"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Clipboard, KeyRound, PlusCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

export interface CourseOption {
  id: string;
  title: string;
  description: string;
  accessMode: "FREE" | "COMMUNITY" | "REDEEM_CODE";
  isActive: boolean;
  leaderboardReward: boolean;
  rewardDurationDays: number;
  certificateEnabled: boolean;
  _count?: { modules: number };
  redeemCodes?: RedeemCodeOption[];
}

interface RedeemCodeOption {
  id: string;
  code: string;
  maxRedemptions: number;
  redemptionCount: number;
  durationDays: number | null;
  expiresAt: string | Date | null;
  isActive: boolean;
}

export function CourseManager({ initialCourses }: { initialCourses: CourseOption[] }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [courses, setCourses] = useState(initialCourses);
  const [form, setForm] = useState({
    title: "",
    description: "",
    accessMode: "REDEEM_CODE" as CourseOption["accessMode"],
    leaderboardReward: false,
    rewardDurationDays: "30",
    certificateEnabled: true,
    codeMaxRedemptions: "1",
    codeDurationDays: "30",
    permanentCode: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          accessMode: form.accessMode,
          leaderboardReward: form.leaderboardReward,
          rewardDurationDays: Number(form.rewardDurationDays),
          certificateEnabled: form.certificateEnabled,
          codeMaxRedemptions: Number(form.codeMaxRedemptions),
          codeDurationDays: form.permanentCode ? null : Number(form.codeDurationDays),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal membuat kelas.");
      setCourses((current) => [...current, {
        ...data.course,
        _count: { modules: 0 },
        redeemCodes: data.redeemCode ? [data.redeemCode] : [],
      }]);
      setForm((current) => ({ ...current, title: "", description: "" }));
      router.refresh();
      success("Kelas baru berhasil dibuat.");
    } catch (err) {
      error(err instanceof Error ? err.message : "Terjadi kesalahan saat membuat kelas.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    success("Kode redeem disalin.");
  };

  const createAnotherCode = async (course: CourseOption) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/courses/${course.id}/codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxRedemptions: Number(form.codeMaxRedemptions),
          durationDays: form.permanentCode ? null : Number(form.codeDurationDays),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal membuat kode tambahan.");
      setCourses((current) => current.map((item) => item.id === course.id
        ? { ...item, redeemCodes: [data.code, ...(item.redeemCodes || [])] }
        : item));
      success("Kode redeem tambahan berhasil dibuat.");
    } catch (err) {
      error(err instanceof Error ? err.message : "Gagal membuat kode tambahan.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCode = async (course: CourseOption, code: RedeemCodeOption) => {
    try {
      const response = await fetch(`/api/admin/courses/${course.id}/codes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeId: code.id, isActive: !code.isActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal memperbarui kode.");
      setCourses((current) => current.map((item) => item.id === course.id
        ? { ...item, redeemCodes: (item.redeemCodes || []).map((savedCode) => savedCode.id === code.id ? data.code : savedCode) }
        : item));
      success(data.code.isActive ? "Kode diaktifkan." : "Kode dinonaktifkan.");
    } catch (err) {
      error(err instanceof Error ? err.message : "Gagal memperbarui kode.");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-slate-200/80 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800"><BookOpen className="h-5 w-5" /></div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Kelas & Akses</h2>
            <p className="text-xs text-slate-500">Buat kelas lanjutan tanpa mengubah lima modul Basic.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-600">Nama kelas
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required minLength={3} placeholder="Contoh: Public Speaking II" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Metode akses
              <select value={form.accessMode} onChange={(event) => setForm({ ...form, accessMode: event.target.value as CourseOption["accessMode"] })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900">
                <option value="FREE">Kelas Basic untuk semua</option>
                <option value="COMMUNITY">Khusus anggota komunitas</option>
                <option value="REDEEM_CODE">Kode redeem / premium</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Deskripsi kelas
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required minLength={10} rows={2} placeholder="Jelaskan materi dan manfaat kelas ini" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
            </label>
          </div>

          {form.accessMode === "REDEEM_CODE" && (
            <div className="grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-600">Maksimal penukaran kode
                <input type="number" min="1" max="10000" value={form.codeMaxRedemptions} onChange={(event) => setForm({ ...form, codeMaxRedemptions: event.target.value })} required className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm" />
              </label>
              <label className="flex items-center gap-2 self-end rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700">
                <input type="checkbox" checked={form.permanentCode} onChange={(event) => setForm({ ...form, permanentCode: event.target.checked })} /> Akses kode berlaku permanen
              </label>
              {!form.permanentCode && <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Durasi akses setelah kode ditukar (hari)
                <input type="number" min="1" max="3650" value={form.codeDurationDays} onChange={(event) => setForm({ ...form, codeDurationDays: event.target.value })} required className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm sm:max-w-xs" />
              </label>}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" checked={form.certificateEnabled} onChange={(event) => setForm({ ...form, certificateEnabled: event.target.checked })} /> Terbitkan sertifikat kelas sendiri</label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" checked={form.leaderboardReward} onChange={(event) => setForm({ ...form, leaderboardReward: event.target.checked })} /> Reward untuk 3 besar leaderboard global bulanan</label>
            {form.leaderboardReward && <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">Durasi reward
              <input type="number" min="1" max="365" value={form.rewardDurationDays} onChange={(event) => setForm({ ...form, rewardDurationDays: event.target.value })} className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm" /> hari
            </label>}
          </div>

          <Button type="submit" variant="primary" size="lg" isLoading={loading}>
            <PlusCircle className="mr-2 h-4 w-4" /> Buat Kelas
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {courses.map((course) => (
          <Card key={course.id} className="border-slate-200/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div><h3 className="font-extrabold text-slate-900">{course.title}</h3><p className="mt-1 text-xs text-slate-500">{course.description}</p></div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{course.accessMode === "FREE" ? "BASIC" : course.accessMode === "COMMUNITY" ? "KOMUNITAS" : "REDEEM"}</span>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">{course._count?.modules ?? 0} modul · {course.certificateEnabled ? "Sertifikat kelas aktif" : "Tanpa sertifikat"}{course.leaderboardReward ? ` · Reward top 3 selama ${course.rewardDurationDays} hari` : ""}</p>
            {course.accessMode === "REDEEM_CODE" && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="text-xs font-extrabold text-slate-800">Kode akses</h4>
                  <Button type="button" variant="outline" size="sm" isLoading={loading} onClick={() => createAnotherCode(course)}>
                    <RefreshCw className="mr-1 h-3.5 w-3.5" /> Buat kode
                  </Button>
                </div>
                {(course.redeemCodes || []).length ? (
                  <div className="space-y-2">
                    {course.redeemCodes!.map((code) => (
                      <div key={code.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate font-mono text-xs font-bold text-slate-900">{code.code}</p>
                          <p className="text-[10px] text-slate-500">{code.redemptionCount}/{code.maxRedemptions} dipakai · {code.durationDays ? `${code.durationDays} hari akses` : "permanen"}{code.expiresAt ? ` · kode berakhir ${new Date(code.expiresAt).toLocaleDateString("id-ID")}` : ""}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button type="button" title="Salin kode" onClick={() => copyCode(code.code)} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-900"><Clipboard className="h-4 w-4" /></button>
                          <button type="button" onClick={() => toggleCode(course, code)} className={`rounded-full px-2 py-1 text-[9px] font-bold ${code.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>{code.isActive ? "Aktif" : "Nonaktif"}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-[11px] text-slate-500">Belum ada kode redeem.</p>}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
