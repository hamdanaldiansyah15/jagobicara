"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, KeyRound, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

interface CommunitySettings {
  communityName: string;
  address: string;
  code: string;
  adminName: string;
  email: string;
  phone: string;
}

export function CommunitySettingsForm({ initialSettings }: { initialSettings: CommunitySettings }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [form, setForm] = useState({ ...initialSettings, password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      error("Konfirmasi password tidak cocok.");
      return;
    }
    if (form.password && form.password.length < 8) {
      error("Password baru minimal 8 karakter.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/community-admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan pengaturan.");
      setForm((current) => ({ ...current, password: "", confirmPassword: "" }));
      success("Informasi komunitas dan akun admin berhasil diperbarui.");
      router.refresh();
    } catch (err) {
      error(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan pengaturan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Card className="border-slate-200/80 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-slate-900">
          <Building2 className="h-5 w-5 text-sky-700" />
          <h2 className="text-lg font-extrabold">Profil Komunitas</h2>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">Nama komunitas
            <input value={form.communityName} onChange={(event) => update("communityName", event.target.value)} required minLength={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
          </label>
          <label className="text-xs font-semibold text-slate-600">Kode komunitas
            <input value={form.code} onChange={(event) => update("code", event.target.value.toUpperCase())} required minLength={4} maxLength={24} pattern="[A-Za-z0-9\-]+" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
          </label>
          <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Alamat komunitas
            <textarea value={form.address} onChange={(event) => update("address", event.target.value)} required minLength={5} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
          </label>
        </div>
      </Card>

      <Card className="border-slate-200/80 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-slate-900">
          <KeyRound className="h-5 w-5 text-sky-700" />
          <h2 className="text-lg font-extrabold">Akun Login Admin</h2>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">Nama admin
            <input value={form.adminName} onChange={(event) => update("adminName", event.target.value)} required minLength={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
          </label>
          <label className="text-xs font-semibold text-slate-600">Email login
            <input type="email" autoComplete="username" value={form.email} onChange={(event) => update("email", event.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
          </label>
          <label className="text-xs font-semibold text-slate-600">Nomor telepon / WhatsApp
            <input type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} required minLength={8} maxLength={20} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
          </label>
        </div>
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="mb-3 text-sm font-bold text-slate-800">Ganti password (opsional)</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-600">Password baru
              <input type="password" autoComplete="new-password" value={form.password} onChange={(event) => update("password", event.target.value)} minLength={8} maxLength={72} placeholder="Kosongkan jika tidak ingin mengganti" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Konfirmasi password baru
              <input type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} minLength={8} maxLength={72} placeholder="Ulangi password baru" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
            </label>
          </div>
        </div>
      </Card>

      <Button type="submit" variant="primary" size="lg" isLoading={loading}>
        <Save className="mr-2 h-4 w-4" /> Simpan Pengaturan
      </Button>
    </form>
  );
}
