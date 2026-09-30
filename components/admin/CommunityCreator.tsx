"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Hash, KeyRound, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

const initialForm = {
  communityName: "",
  address: "",
  code: "",
  adminName: "",
  email: "",
  phone: "",
  password: "",
};

export function CommunityCreator() {
  const router = useRouter();
  const { success, error } = useToast();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const update = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const generateCode = () => {
    const prefix = form.communityName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 12) || "KOMUNITAS";
    const suffix = String(Math.floor(1000 + Math.random() * 9000));
    update("code", `${prefix}-${suffix}`);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/admin/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal membuat komunitas.");

      success(`Komunitas ${data.community.name} dan akun ${data.admin.email} berhasil dibuat.`);
      setForm(initialForm);
      router.refresh();
    } catch (err) {
      error(err instanceof Error ? err.message : "Terjadi kesalahan saat membuat komunitas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200/80 p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
          <PlusCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Buat Komunitas & Akun Admin</h2>
          <p className="text-sm text-slate-500">Satu kali simpan untuk membuat kode komunitas dan akses adminnya.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><Building2 className="h-4 w-4 text-sky-700" /> Informasi Komunitas</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-600">Nama komunitas
              <input value={form.communityName} onChange={(event) => update("communityName", event.target.value)} required minLength={3} placeholder="Contoh: Komunitas Pemuda Makassar" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Kode komunitas
              <div className="mt-1 flex gap-2">
                <input value={form.code} onChange={(event) => update("code", event.target.value.toUpperCase())} required minLength={4} maxLength={24} pattern="[A-Za-z0-9\-]+" placeholder="Contoh: MAKASSAR-2026" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
                <button type="button" onClick={generateCode} title="Buat kode otomatis" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Hash className="h-4 w-4" /> Buat</button>
              </div>
            </label>
            <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Alamat komunitas
              <textarea value={form.address} onChange={(event) => update("address", event.target.value)} required minLength={5} rows={2} placeholder="Kota/kabupaten, provinsi atau alamat lengkap" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
            </label>
          </div>
        </section>

        <section className="space-y-3 border-t border-slate-100 pt-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><KeyRound className="h-4 w-4 text-sky-700" /> Akun Admin Komunitas</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-600">Nama admin
              <input value={form.adminName} onChange={(event) => update("adminName", event.target.value)} required minLength={2} placeholder="Nama penanggung jawab" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Email login
              <input type="email" autoComplete="off" value={form.email} onChange={(event) => update("email", event.target.value)} required placeholder="admin@komunitas.id" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Nomor telepon / WhatsApp
              <input type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} required minLength={8} maxLength={20} placeholder="08xxxxxxxxxx" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Password awal
              <input type="password" autoComplete="new-password" value={form.password} onChange={(event) => update("password", event.target.value)} required minLength={8} maxLength={72} placeholder="Minimal 8 karakter" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" />
            </label>
          </div>
        </section>

        <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Buat Komunitas & Akun
        </Button>
      </form>
    </Card>
  );
}
