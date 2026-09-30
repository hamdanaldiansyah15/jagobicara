"use client";

import Link from "next/link";
import { Crown, Medal, Users, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LeaderboardEntry } from "@/lib/leaderboard/calculator";

interface LeaderboardBoardsProps {
  communityRankings: LeaderboardEntry[];
  globalRankings: LeaderboardEntry[];
  userCommunity: { id: string; name: string; code: string } | null;
  currentUserId: string;
  previousSeasonRankings: LeaderboardEntry[];
  previousSeasonName: string;
}

const pointsFormatter = new Intl.NumberFormat("id-ID");

function RankingTable({
  title,
  scope,
  rankings,
  currentUserId,
}: {
  title: string;
  scope: string;
  rankings: LeaderboardEntry[];
  currentUserId: string;
}) {
  const topTen = rankings.slice(0, 10);
  const currentUser = rankings.find((entry) => entry.userId === currentUserId);
  const isCommunity = scope === "community";

  return (
    <Card className="overflow-hidden border-slate-200/80 p-0">
      <div className={`relative flex min-h-[112px] items-end justify-between gap-4 overflow-hidden px-5 py-5 sm:px-7 ${isCommunity ? "bg-[#176b61] text-white" : "bg-[#bd4d32] text-white"}`}>
        <div className={`absolute inset-y-0 right-0 w-2/5 ${isCommunity ? "bg-[#0f514a]" : "bg-[#963922]"}`} style={{ clipPath: "polygon(25% 0, 100% 0, 100% 100%, 0 100%)" }} />
        <div className="relative z-10 min-w-0">
          <p className={`text-[10px] font-extrabold uppercase text-white/70`}>{isCommunity ? "KLASEMEN KOMUNITAS" : "KLASEMEN NASIONAL"}</p>
          <h2 className="mt-1 truncate text-xl font-black sm:text-2xl">{title}</h2>
          <p className="mt-1 text-xs text-white/80">Poin season aktif</p>
        </div>
        <div className="relative z-10 shrink-0 text-right">
          <p className="text-2xl font-black tabular-nums sm:text-3xl">{rankings.length}</p>
          <p className="text-[10px] font-bold uppercase text-white/70">peserta</p>
        </div>
      </div>

      {!topTen.length ? (
        <>
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-bold text-slate-800">Belum ada latihan valid bulan ini.</p>
            <p className="mt-1 text-xs text-slate-500">Mulai latihan untuk mengumpulkan poin pertama.</p>
            <Link href="/bicara" className="mt-4 inline-block">
              <Button variant="primary" size="sm">Mulai Bicara <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
            </Link>
          </div>
          <div className="border-t-2 border-dashed border-sky-200 bg-sky-50/70 px-3 py-3 sm:px-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-sky-700 px-1.5 text-xs font-black text-white">-</span>
                <div><p className="text-xs font-extrabold text-slate-900">Posisi kamu</p><p className="text-[10px] text-slate-500">Belum ada latihan valid</p></div>
              </div>
              <span className="text-right"><strong className="font-black tabular-nums text-sky-800">0</strong><span className="ml-1 text-[9px] font-bold uppercase text-sky-700">poin</span></span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] text-left">
              <thead className={`${isCommunity ? "bg-[#e5f3ef] text-[#285d55]" : "bg-[#faece7] text-[#87412f]"} text-[10px] font-extrabold uppercase`}>
                <tr>
                  <th className="px-3 py-3 text-center sm:px-4">#</th>
                  <th className="px-2 py-3">Nama</th>
                  <th className="px-2 py-3 text-right">Terbaik</th>
                  <th className="px-3 py-3 text-right sm:px-4">Poin</th>
                </tr>
              </thead>
              <tbody>
                {topTen.map((entry) => {
                  const medal = entry.rank === 1 ? "gold" : entry.rank === 2 ? "silver" : entry.rank === 3 ? "bronze" : null;
                  return (
                    <tr key={entry.userId} className={`${entry.userId === currentUserId ? "bg-sky-50/70" : entry.rank === 1 ? "bg-amber-50/75" : entry.rank === 2 ? "bg-slate-50" : entry.rank === 3 ? "bg-orange-50/60" : "bg-white"} border-t border-slate-100`}>
                      <td className="w-12 px-3 py-3 text-center sm:px-4">
                        {medal ? (
                          <span className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${medal === "gold" ? "bg-amber-100 text-amber-700" : medal === "silver" ? "bg-slate-200 text-slate-600" : "bg-orange-100 text-orange-800"}`} title={`Peringkat ${entry.rank}`}>
                            {entry.rank === 1 ? <Crown className="h-4 w-4" /> : <Medal className="h-4 w-4" />}
                          </span>
                        ) : <span className="text-xs font-bold text-slate-400">{entry.rank}</span>}
                      </td>
                      <td className="max-w-[200px] px-2 py-3">
                        <p className="truncate text-xs font-bold text-slate-900">{entry.name}{entry.userId === currentUserId ? <span className="ml-1.5 text-[10px] font-bold text-sky-700">KAMU</span> : null}</p>
                        <p className="truncate text-[10px] text-slate-500">{entry.communityName} · {entry.validAttemptsCount} latihan</p>
                      </td>
                      <td className="px-2 py-3 text-right text-xs font-semibold text-slate-600">{entry.bestScore}</td>
                      <td className="px-3 py-3 text-right sm:px-4">
                        <span className="font-black tabular-nums text-slate-900">{pointsFormatter.format(entry.score)}</span>
                        <span className="ml-1 text-[9px] font-bold uppercase text-slate-400">poin</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {currentUser && (
            <div className="border-t-2 border-dashed border-sky-200 bg-sky-50/70 px-3 py-3 sm:px-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-sky-700 px-1.5 text-xs font-black text-white">{currentUser.rank}</span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-extrabold text-slate-900">{currentUser.name} <span className="text-sky-700">(Kamu)</span></p>
                    <p className="truncate text-[10px] text-slate-500">{currentUser.rank <= 10 ? `Kamu juga ada di daftar 10 besar · ${currentUser.validAttemptsCount} latihan` : `Posisi kamu · ${currentUser.validAttemptsCount} latihan`}</p>
                  </div>
                </div>
                <span className="shrink-0 text-right"><strong className="font-black tabular-nums text-sky-800">{pointsFormatter.format(currentUser.score)}</strong><span className="ml-1 text-[9px] font-bold uppercase text-sky-700">poin</span></span>
              </div>
            </div>
          )}
          {!currentUser && (
            <div className="border-t-2 border-dashed border-sky-200 bg-sky-50/70 px-3 py-3 sm:px-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-sky-700 px-1.5 text-xs font-black text-white">-</span>
                  <div><p className="text-xs font-extrabold text-slate-900">Posisi kamu</p><p className="text-[10px] text-slate-500">Belum ada latihan valid bulan ini</p></div>
                </div>
                <span className="text-right"><strong className="font-black tabular-nums text-sky-800">0</strong><span className="ml-1 text-[9px] font-bold uppercase text-sky-700">poin</span></span>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

export function LeaderboardBoards({
  communityRankings,
  globalRankings,
  userCommunity,
  currentUserId,
  previousSeasonRankings,
  previousSeasonName,
}: LeaderboardBoardsProps) {
  return (
    <div className="space-y-5">
      <div className="border-l-[3px] border-[#176b61] py-1 pl-3">
        <p className="text-xs font-semibold text-slate-700">Poin bulan ini = nilai tertinggi × jumlah latihan valid</p>
        <p className="mt-1 text-[11px] text-slate-500">Peringkat diperbarui dari latihan dalam season aktif.</p>
      </div>

      {userCommunity ? (
        <RankingTable title={userCommunity.name} scope="community" rankings={communityRankings} currentUserId={currentUserId} />
      ) : (
        <Card className="border-dashed border-slate-300 p-5">
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Leaderboard Komunitas</h2>
              <p className="mt-1 text-xs text-slate-600">Bergabung dengan komunitas untuk melihat peringkat komunitasmu.</p>
              <Link href="/akun/komunitas" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:underline">Gabung komunitas <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        </Card>
      )}

      <RankingTable title="Global · Semua Komunitas" scope="global" rankings={globalRankings} currentUserId={currentUserId} />

      <Card className="overflow-hidden border-slate-200/80 p-0">
        <div className="flex flex-col gap-1 border-b border-orange-100 bg-orange-50/70 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-orange-800">Apresiasi season sebelumnya</p>
            <h2 className="mt-1 text-base font-extrabold text-slate-900">Selamat kepada 10 terbaik</h2>
            <p className="text-xs text-slate-600">{previousSeasonName}</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">Peringkat global</span>
        </div>
        {previousSeasonRankings.length ? (
          <ol className="divide-y divide-slate-100 px-4 sm:px-5">
            {previousSeasonRankings.map((entry) => (
              <li key={entry.userId} className="flex min-w-0 items-center gap-3 py-2.5">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${entry.rank <= 3 ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-600"}`}>
                  {entry.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">{entry.name}</p>
                  <p className="truncate text-[10px] text-slate-500">{entry.communityName}</p>
                </div>
                <span className="shrink-0 text-right text-xs font-black tabular-nums text-orange-800">
                  {pointsFormatter.format(entry.score)} <span className="text-[9px] font-bold">poin</span>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="px-5 py-6 text-center text-xs text-slate-500">Belum ada data leaderboard untuk {previousSeasonName}.</p>
        )}
      </Card>
    </div>
  );
}
