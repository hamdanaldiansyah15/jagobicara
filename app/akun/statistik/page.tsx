export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BarChart3, BookOpen, Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export default async function AccountStatisticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [totalAttempts, bestScore, averageScore, modulesCompleted, badgesEarned, totalModules] = await Promise.all([
    prisma.speakingAttempt.count({ where: { userId: user.id, valid: true } }),
    prisma.speakingAttempt.findFirst({ where: { userId: user.id, valid: true }, orderBy: { finalScore: "desc" } }),
    prisma.speakingAttempt.aggregate({ where: { userId: user.id, valid: true }, _avg: { finalScore: true } }),
    prisma.moduleProgress.count({ where: { userId: user.id, isCompleted: true } }),
    prisma.userBadge.count({ where: { userId: user.id } }),
    prisma.module.count(),
  ]);

  const cards = [
    { label: "Total latihan bicara", value: totalAttempts, icon: BarChart3 },
    { label: "Best score", value: bestScore?.finalScore ?? 0, icon: Trophy },
    { label: "Average score", value: Math.round(averageScore._avg.finalScore ?? 0), icon: BookOpen },
    { label: "Badges earned", value: badgesEarned, icon: Trophy },
  ];

  return (
    <AppShell user={user}>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/akun" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Speaking Statistics</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="border-slate-200/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900">{value}</h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="border-slate-200/80 p-5">
          <h2 className="text-lg font-extrabold text-slate-900">Progress Belajar</h2>
          <p className="mt-2 text-sm text-slate-600">Kamu telah menyelesaikan {modulesCompleted} modul dari {totalModules} total.</p>
        </Card>
      </div>
    </AppShell>
  );
}
