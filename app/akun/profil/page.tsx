export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AccountProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell user={user}>
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/akun" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Profil</h1>
        </div>

        <Card className="border-slate-200/80 p-6">
          <form action="/api/auth/profile" method="post" className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nama Lengkap</label>
              <input name="name" defaultValue={user.name} required className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Umur</label>
                <input name="age" type="number" min="12" max="99" defaultValue={user.age} required className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Gender</label>
                <select name="gender" defaultValue={user.gender} className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                  <option value="Tidak disebutkan">Tidak disebutkan</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
              <input name="email" type="email" defaultValue={user.email} required className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">WhatsApp</label>
              <input name="whatsapp" defaultValue={user.whatsapp} required className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <button type="submit" className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover">
              Simpan Perubahan
            </button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
