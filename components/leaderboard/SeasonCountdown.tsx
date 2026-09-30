"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSeasonCountdown } from "@/lib/leaderboard/calendar";

interface SeasonCountdownProps {
  initialSeasonName: string;
}

export const SeasonCountdown: React.FC<SeasonCountdownProps> = ({ initialSeasonName }) => {
  const router = useRouter();
  const [season, setSeason] = useState<ReturnType<typeof getSeasonCountdown> | null>(null);
  const lastSeasonKey = useRef<string | null>(null);

  useEffect(() => {
    const updateSeason = () => {
      const currentSeason = getSeasonCountdown();
      if (lastSeasonKey.current && lastSeasonKey.current !== currentSeason.seasonKey) {
        router.refresh();
      }
      lastSeasonKey.current = currentSeason.seasonKey;
      setSeason(currentSeason);
    };

    updateSeason();
    const interval = window.setInterval(updateSeason, 1000);
    return () => window.clearInterval(interval);
  }, [router]);

  const seasonName = season?.seasonName || initialSeasonName;
  const timerUnits = [
    { value: season?.days ?? 0, label: "HARI" },
    { value: season?.hours ?? 0, label: "JAM" },
    { value: season?.minutes ?? 0, label: "MENIT" },
    { value: season?.seconds ?? 0, label: "DETIK" },
  ];

  return (
    <section aria-label="Countdown season" className="overflow-hidden rounded-lg border border-[#3b2a20] bg-[#211b18] text-white shadow-sm">
      <div className="grid gap-2.5 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:px-4 sm:py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase text-[#FDBA74]">
            <span className="h-1.5 w-1.5 bg-[#F97316]" />
            <span>Season aktif</span>
            <span className="text-white/35">/</span>
            <span className="text-white/60">Klasemen bulanan</span>
          </div>
          <h2 className="mt-1 text-base font-extrabold leading-tight text-white sm:text-lg">{seasonName}</h2>
          <div className="mt-2 flex max-w-sm items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden bg-white/15">
              <div className="h-full bg-[#F97316] transition-[width] duration-500" style={{ width: `${season?.progress ?? 0}%` }} />
            </div>
            <span className="w-7 text-right font-mono text-[9px] font-bold tabular-nums text-[#FBBF24]">{season?.progress ?? 0}%</span>
          </div>
        </div>

        <div className="grid grid-cols-4 divide-x divide-white/15 border-t border-white/10 pt-2 sm:w-[256px] sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0" aria-label="Sisa waktu season">
          {timerUnits.map((unit) => (
            <div key={unit.label} className="min-w-0 px-1 text-center sm:px-2">
              <div className="overflow-hidden font-mono text-xl font-black leading-none tabular-nums text-white sm:text-2xl">
                <span key={`${unit.label}-${unit.value}`} className="season-count-tick inline-block">{String(unit.value).padStart(2, "0")}</span>
              </div>
              <div className="mt-1 text-[7px] font-extrabold text-[#FBBF24] sm:text-[8px]">{unit.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};