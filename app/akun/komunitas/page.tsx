import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { CommunityJoinForm } from "@/components/account/CommunityJoinForm";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AccountCommunityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell user={user}>
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/akun" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Komunitas</h1>
        </div>

        {user.community ? (
          <Card className="border-l-4 border-l-[#31584f] border-slate-200/80 p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-800"><BadgeCheck className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-bold uppercase text-emerald-800">Keanggotaan aktif</p>
                <h2 className="mt-1 text-lg font-extrabold text-slate-900">{user.community.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Akun ini sudah terdaftar di satu komunitas. Setiap akun hanya dapat bergabung dengan satu komunitas.</p>
              </div>
            </div>
          </Card>
        ) : (
          <CommunityJoinForm />
        )}

        {!user.community && <p className="flex items-start gap-2 px-1 text-xs leading-5 text-slate-500"><Users className="mt-0.5 h-4 w-4 shrink-0 text-[#31584f]" /> Setelah bergabung, komunitas yang dipilih akan menjadi komunitas akunmu.</p>}
      </div>
    </AppShell>
  );
}
