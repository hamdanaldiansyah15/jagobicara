export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BarChart3, ShieldCheck, Trophy, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { getCurrentSeasonKey, getSeasonLeaderboard } from "@/lib/leaderboard/calculator";

export default async function CommunityAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "COMMUNITY_ADMIN") redirect("/beranda");

  const communityMember = await prisma.communityMember.findFirst({
    where: { userId: user.id },
    include: { community: true },
  });

  if (!communityMember) redirect("/beranda");

  const [totalMembers, validAttempts, averageScore, leaderboard] = await Promise.all([
    prisma.communityMember.count({ where: { communityId: communityMember.communityId } }),
    prisma.speakingAttempt.count({
      where: {
        valid: true,
        user: { communityMembers: { some: { communityId: communityMember.communityId } } },
      },
    }),
    prisma.speakingAttempt.aggregate({
      _avg: { finalScore: true },
      where: {
        valid: true,
        user: { communityMembers: { some: { communityId: communityMember.communityId } } },
      },
    }),
    getSeasonLeaderboard({ communityId: communityMember.communityId, seasonKey: getCurrentSeasonKey(), limit: 5 }),
  ]);

  const cards = [
    { label: "Total anggota", value: totalMembers, icon: Users },
    { label: "Aktivitas latihan", value: validAttempts, icon: BarChart3 },
    { label: "Rata-rata score", value: averageScore._avg.finalScore ? Math.round(averageScore._avg.finalScore) : 0, icon: Trophy },
    { label: "Leaderboard", value: leaderboard.length, icon: ShieldCheck },
  ];

  return (
    <AppShell user={user}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">Community Admin</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{communityMember.community.name}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/community-admin/pengaturan" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Edit Profil Komunitas
            </Link>
            <Link href="/community-admin/members" className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
              Lihat Anggota <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="border-slate-200/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900">{value}</h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="border-slate-200/80 p-5">
            <h2 className="text-lg font-extrabold text-slate-900">Informasi Komunitas</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Nama: {communityMember.community.name}</li>
              <li>Alamat: {communityMember.community.address || "Belum diisi"}</li>
              <li>Kode: {communityMember.community.code}</li>
              <li>Status: {communityMember.community.status}</li>
            </ul>
          </Card>

          <Card className="border-slate-200/80 p-5">
            <h2 className="text-lg font-extrabold text-slate-900">Akses Cepat</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/community-admin/members" className="text-sky-700 hover:underline">Members</Link></li>
              <li><Link href="/community-admin/leaderboard" className="text-sky-700 hover:underline">Leaderboard</Link></li>
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
