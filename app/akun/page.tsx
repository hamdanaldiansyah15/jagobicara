export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, BookOpen, Check, LogOut, Mail, Mic, Phone, Shield, Trophy, UserRound, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [totalAttempts, bestScore, modulesCompleted, badgesEarned, certificate, totalModules] = await Promise.all([
    prisma.speakingAttempt.count({ where: { userId: user.id, valid: true } }),
    prisma.speakingAttempt.findFirst({ where: { userId: user.id, valid: true }, orderBy: { finalScore: "desc" } }),
    prisma.moduleProgress.count({ where: { userId: user.id, isCompleted: true } }),
    prisma.userBadge.count({ where: { userId: user.id } }),
    prisma.certificate.findUnique({ where: { userId: user.id } }),
    prisma.module.count(),
  ]);

  const stats = [
    { label: "Latihan bicara", value: totalAttempts, icon: Mic, tone: "border-t-orange-500 bg-orange-50 text-orange-800" },
    { label: "Skor terbaik", value: bestScore?.finalScore ?? 0, icon: Trophy, tone: "border-t-amber-500 bg-amber-50 text-amber-800" },
    { label: "Modul selesai", value: modulesCompleted, icon: BookOpen, tone: "border-t-emerald-600 bg-emerald-50 text-emerald-800" },
    { label: "Badge diperoleh", value: badgesEarned, icon: Award, tone: "border-t-sky-600 bg-sky-50 text-sky-800" },
  ];
  const progressPercent = totalModules > 0 ? Math.min(100, Math.round((modulesCompleted / totalModules) * 100)) : 0;
  const initials = user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <AppShell user={user}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-[#31584f]">Akun</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Profil & Progres</h1>
          </div>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </form>
        </div>

        <Card className="overflow-hidden border-slate-200/80 p-0">
          <div className="flex flex-col gap-4 bg-[#173d36] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f2b36d] text-lg font-black text-[#3b281a] ring-4 ring-white/15">
                {initials}
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-100">Profil peserta</p>
                <h2 className="mt-0.5 text-xl font-extrabold">{user.name}</h2>
                <p className="mt-1 text-xs text-white/75">{user.community?.name ?? "Belum terhubung dengan komunitas"}</p>
              </div>
            </div>
            <Link href="/akun/profil" className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-md bg-white px-4 text-sm font-bold text-[#173d36] transition-colors hover:bg-emerald-50 sm:self-auto">
              <UserRound className="h-4 w-4" /> Edit profil
            </Link>
          </div>
          <dl className="grid grid-cols-1 gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Email", value: user.email, icon: Mail },
              { label: "WhatsApp", value: user.whatsapp, icon: Phone },
              { label: "Usia", value: `${user.age} tahun`, icon: UserRound },
              { label: "Gender", value: user.gender, icon: Users },
              { label: "Komunitas", value: user.community?.name ?? "Belum bergabung", icon: Award },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex min-w-0 items-center gap-3 bg-white px-4 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#eef5f1] text-[#31584f]"><Icon className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <dt className="text-[10px] font-bold uppercase text-slate-500">{label}</dt>
                  <dd className="truncate text-sm font-semibold text-slate-900">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <Card key={label} className={`border-t-4 border-x border-b border-slate-200/80 p-4 ${tone}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold">{label}</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900">{value}</h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white/80">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Card className="border-slate-200/80 p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-extrabold">Komunitas</h2>
            </div>
            <p className="mt-4 text-sm text-slate-600">{user.community ? `Akun ini terdaftar di ${user.community.name}.` : "Kamu belum bergabung dengan komunitas."}</p>
            <div className="mt-4">
              <Link href="/akun/komunitas" className="text-sm font-bold text-primary hover:underline">{user.community ? "Lihat status keanggotaan" : "Gabung Komunitas"}</Link>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="border-slate-200/80 p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <BookOpen className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-extrabold">Progres Belajar</h2>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>{modulesCompleted} dari {totalModules} modul selesai</span>
              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-black text-emerald-800">{progressPercent}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Progres modul" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
              <div className="h-full rounded-full bg-[#31584f] transition-[width] duration-700" style={{ width: `${progressPercent}%` }} />
            </div>
            {progressPercent === 100 && totalModules > 0 && <p className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><Check className="h-3.5 w-3.5" /> Semua modul tuntas</p>}
            <Link href="/modulku" className="mt-4 inline-flex text-sm font-bold text-primary hover:underline">Lanjutkan belajar</Link>
          </Card>

          <Card className="border-slate-200/80 p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-extrabold">Sertifikat</h2>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {certificate ? `Sertifikat tersedia: ${certificate.certificateNumber}` : "Selesaikan seluruh modul untuk mendapatkan certificate."}
            </p>
            <div className="mt-4">
              <Link href="/akun/sertifikat" className="text-sm font-bold text-primary hover:underline">Lihat Sertifikat</Link>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
