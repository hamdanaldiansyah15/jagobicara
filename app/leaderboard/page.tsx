export const dynamic = "force-dynamic";

import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { SeasonCountdown } from "@/components/leaderboard/SeasonCountdown";
import { LeaderboardBoards } from "@/components/leaderboard/LeaderboardBoards";
import {
  getCurrentSeasonName,
  getCurrentSeasonKey,
  getPreviousSeasonKey,
  getSeasonNameFromKey,
  getSeasonLeaderboardSnapshot,
} from "@/lib/leaderboard/calculator";

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const seasonKey = getCurrentSeasonKey();
  const seasonName = getCurrentSeasonName();
  const previousSeasonKey = getPreviousSeasonKey();
  const previousSeasonName = getSeasonNameFromKey(previousSeasonKey);

  let community = null;
  if (user.community) {
    community = await prisma.community.findUnique({
      where: { code: user.community.code },
    });
  }

  // Fetch rankings
  const [myCommunityRankings, globalRankings, previousSeasonRankings] = await Promise.all([
    community
      ? getSeasonLeaderboardSnapshot({
        communityId: community.id,
        seasonKey,
      })
      : Promise.resolve([]),
    getSeasonLeaderboardSnapshot({
    seasonKey,
    }),
    getSeasonLeaderboardSnapshot({ seasonKey: previousSeasonKey }),
  ]);

  return (
    <AppShell user={user}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-[10px] font-extrabold uppercase text-orange-800">
            <span className="h-px w-6 bg-amber-400" />
            <span>Klasemen Bulanan</span>
            <span className="h-px w-6 bg-amber-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Leaderboard {seasonName}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Nilai terbaik dan konsistensi latihan dihitung dalam satu poin bulanan.
          </p>
        </div>

        {/* Live Countdown */}
        <SeasonCountdown initialSeasonName={seasonName} />

        {/* Interactive Tabs & Rankings */}
        <LeaderboardBoards
          communityRankings={myCommunityRankings}
          globalRankings={globalRankings}
          userCommunity={community}
          currentUserId={user.id}
          previousSeasonRankings={previousSeasonRankings.slice(0, 10)}
          previousSeasonName={previousSeasonName}
        />
      </div>
    </AppShell>
  );
}
