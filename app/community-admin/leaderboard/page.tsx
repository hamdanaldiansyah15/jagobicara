export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { getCurrentSeasonKey, getSeasonLeaderboard } from "@/lib/leaderboard/calculator";

export default async function CommunityAdminLeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "COMMUNITY_ADMIN") redirect("/beranda");

  const communityMember = await prisma.communityMember.findFirst({
    where: { userId: user.id },
    include: { community: true },
  });

  if (!communityMember) redirect("/beranda");

  const rankings = await getSeasonLeaderboard({
    communityId: communityMember.communityId,
    seasonKey: getCurrentSeasonKey(),
    limit: 10,
  });

  return (
    <AppShell user={user}>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/community-admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Leaderboard Komunitas</h1>
        </div>

        <Card className="border-slate-200/80 p-5">
          <div className="flex items-center gap-2 text-sky-700">
            <Trophy className="w-5 h-5" />
            <h2 className="text-lg font-extrabold">{communityMember.community.name}</h2>
          </div>

          <div className="mt-4 space-y-3">
            {rankings.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada pemain yang memiliki skor valid di season ini.</p>
            ) : (
              rankings.map((item) => (
                <div key={item.userId} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">#{item.rank}</p>
                    <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Score</p>
                    <p className="text-lg font-black text-sky-700">{item.score}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
