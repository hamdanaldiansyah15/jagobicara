export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, Building2, ShieldCheck, Trophy, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/beranda");

  const [totalUsers, totalCommunities, totalAttempts, totalCertificates, totalModules, totalCourses] = await Promise.all([
    prisma.user.count(),
    prisma.community.count(),
    prisma.speakingAttempt.count({ where: { valid: true } }),
    prisma.certificate.count(),
    prisma.module.count(),
    prisma.learningCourse.count(),
  ]);

  const cards = [
    { label: "Total Users", value: totalUsers, icon: Users, href: "/admin/users", tone: "bg-indigo-50 text-indigo-700" },
    { label: "Total Communities", value: totalCommunities, icon: Building2, href: "/admin/communities", tone: "bg-sky-50 text-sky-700" },
    { label: "Total Speaking Attempts", value: totalAttempts, icon: Trophy, href: "/admin/modules", tone: "bg-amber-50 text-amber-700" },
    { label: "Total Certificates", value: totalCertificates, icon: ShieldCheck, href: "/admin/certificates", tone: "bg-emerald-50 text-emerald-700" },
    { label: "Total Kelas", value: totalCourses, icon: BookOpen, href: "/admin/courses", tone: "bg-teal-50 text-teal-700" },
  ];

  return (
    <AppShell user={user}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">Super Admin</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Dashboard Utama</h1>
          </div>
          <Link href="/admin/users" className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">
            Lihat Manajemen <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {cards.map(({ label, value, icon: Icon, href, tone }) => (
            <Link key={label} href={href} className="block">
              <Card className="h-full p-4 border-slate-200/80 hover:border-purple-200 hover:shadow-md transition-all">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <h3 className="mt-2 text-2xl font-black text-slate-900">{value}</h3>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="border-slate-200/80 p-5">
            <h2 className="text-lg font-extrabold text-slate-900">Kelola Platform</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li><Link href="/admin/users" className="text-primary hover:underline">Users</Link></li>
              <li><Link href="/admin/communities" className="text-primary hover:underline">Communities</Link></li>
              <li><Link href="/admin/courses" className="text-primary hover:underline">Kelas & Akses</Link></li>
              <li><Link href="/admin/modules" className="text-primary hover:underline">Modul & Kuis</Link></li>
              <li><Link href="/admin/questions" className="text-primary hover:underline">Questions</Link></li>
              <li><Link href="/admin/topics" className="text-primary hover:underline">Topics</Link></li>
              <li><Link href="/admin/templates" className="text-primary hover:underline">Templates</Link></li>
              <li><Link href="/admin/certificates" className="text-primary hover:underline">Certificates</Link></li>
            </ul>
          </Card>

          <Card className="border-slate-200/80 p-5">
            <h2 className="text-lg font-extrabold text-slate-900">Ringkasan Sistem</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>Modul aktif</span><strong>{totalModules}</strong></div>
              <div className="flex items-center justify-between"><span>Komunitas aktif</span><strong>{totalCommunities}</strong></div>
              <div className="flex items-center justify-between"><span>Latihan valid</span><strong>{totalAttempts}</strong></div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
