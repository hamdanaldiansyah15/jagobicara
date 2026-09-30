"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trophy, Users, Globe, Info, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LeaderboardEntry } from "@/lib/leaderboard/calculator";

interface LeaderboardViewProps {
  myCommunityRankings: LeaderboardEntry[];
  globalRankings: LeaderboardEntry[];
  userCommunity: { id: string; name: string; code: string } | null;
  currentUserId: string;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  myCommunityRankings,
  globalRankings,
  userCommunity,
  currentUserId,
}) => {
  const [activeTab, setActiveTab] = useState<"community" | "global">(
    userCommunity ? "community" : "global"
  );

  const currentList = activeTab === "community" ? myCommunityRankings : globalRankings;

  const top3 = currentList.slice(0, 3);
  const remaining = currentList.slice(3);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl max-w-sm mx-auto">
        <button
          onClick={() => setActiveTab("community")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === "community"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Komunitas Saya</span>
        </button>

        <button
          onClick={() => setActiveTab("global")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === "global"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Semua Komunitas</span>
        </button>
      </div>

      {/* Formula Transparency Note */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
        <Info className="w-3.5 h-3.5 text-slate-400" />
        <span>Poin dihitung dari nilai tertinggi dikalikan jumlah latihan valid pada season aktif.</span>
      </div>

      {/* Empty State when no community */}
      {activeTab === "community" && !userCommunity && (
        <Card className="text-center py-12 px-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Kamu Belum Bergabung dengan Komunitas
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Masukkan kode komunitas (contoh: <strong>SIMBANG26</strong>) untuk melihat klasemen antarteman komunitasmu.
            </p>
          </div>
          <Link href="/akun">
            <Button variant="primary" size="md">
              <span>Gabung Komunitas Sekarang</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </Card>
      )}

      {/* When community exists but no scores */}
      {activeTab === "community" && userCommunity && currentList.length === 0 && (
        <Card className="text-center py-12 px-6 space-y-3">
          <p className="text-sm font-bold text-slate-800">
            Belum ada latihan yang tercatat di {userCommunity.name} bulan ini.
          </p>
          <p className="text-xs text-slate-500">
            Jadilah yang pertama berlatih dan tempati posisi teratas!
          </p>
          <Link href="/bicara">
            <Button variant="primary" size="md">
              Mulai Bicara Sekarang
            </Button>
          </Link>
        </Card>
      )}

      {/* Podium for Top 3 */}
      {currentList.length > 0 && (
        <div className="pt-6 pb-2">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-lg mx-auto">
            {/* Rank 2 (Silver) */}
            {top3[1] ? (
              <div className="flex flex-col items-center">
                <div className="text-2xl mb-1">🥈</div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center font-bold text-slate-700 text-sm shadow-sm">
                  {top3[1].name.charAt(0)}
                </div>
                <p className="text-xs font-bold text-slate-800 mt-1 truncate max-w-[90px] sm:max-w-none text-center">
                  {top3[1].name}
                </p>
                <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                  {top3[1].communityName}
                </span>
                <div className="mt-2 w-full bg-slate-200/80 rounded-t-xl py-3 text-center border-t-2 border-slate-300">
                  <span className="font-black text-xs sm:text-sm text-slate-800">
                    {top3[1].score}
                  </span>
                  {top3[1].isProvisional && (
                    <span className="block text-[8px] text-amber-600 font-medium">
                      (1 skor)
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div />
            )}

            {/* Rank 1 (Gold) */}
            {top3[0] ? (
              <div className="flex flex-col items-center -mt-6">
                <div className="text-3xl mb-1">🥇</div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center font-black text-amber-800 text-base shadow-md">
                  {top3[0].name.charAt(0)}
                </div>
                <p className="text-xs sm:text-sm font-black text-slate-900 mt-1 truncate max-w-[100px] sm:max-w-none text-center">
                  {top3[0].name}
                </p>
                <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                  {top3[0].communityName}
                </span>
                <div className="mt-2 w-full bg-gradient-to-t from-amber-200 to-amber-100 rounded-t-2xl py-6 text-center border-t-2 border-amber-400 shadow-sm">
                  <span className="font-black text-sm sm:text-base text-amber-900">
                    {top3[0].score}
                  </span>
                  {top3[0].isProvisional && (
                    <span className="block text-[9px] text-amber-700 font-medium">
                      (1 skor)
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div />
            )}

            {/* Rank 3 (Bronze) */}
            {top3[2] ? (
              <div className="flex flex-col items-center">
                <div className="text-2xl mb-1">🥉</div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-50 border-2 border-amber-600/30 flex items-center justify-center font-bold text-amber-900 text-sm shadow-sm">
                  {top3[2].name.charAt(0)}
                </div>
                <p className="text-xs font-bold text-slate-800 mt-1 truncate max-w-[90px] sm:max-w-none text-center">
                  {top3[2].name}
                </p>
                <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                  {top3[2].communityName}
                </span>
                <div className="mt-2 w-full bg-amber-100/70 rounded-t-xl py-2 text-center border-t-2 border-amber-600/40">
                  <span className="font-black text-xs sm:text-sm text-amber-900">
                    {top3[2].score}
                  </span>
                  {top3[2].isProvisional && (
                    <span className="block text-[8px] text-amber-700 font-medium">
                      (1 skor)
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
      )}

      {/* Rankings 4-10 */}
      {remaining.length > 0 && (
        <Card className="border-slate-200/80 p-4 sm:p-5">
          <div className="space-y-2">
            {remaining.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-colors ${
                  entry.userId === currentUserId
                    ? "bg-indigo-50 border-indigo-200 font-semibold"
                    : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-xs text-slate-400">
                    #{entry.rank}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {entry.name} {entry.userId === currentUserId && "(Kamu)"}
                    </p>
                    <p className="text-[10px] text-slate-400">{entry.communityName}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-primary bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
                    {entry.score}
                  </span>
                  {entry.isProvisional && (
                    <span className="block text-[9px] text-amber-600 font-medium">
                      (1 latihan)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
