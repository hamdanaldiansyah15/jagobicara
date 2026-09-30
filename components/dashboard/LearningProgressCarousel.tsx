"use client";

import { KeyboardEvent, TouchEvent, useState } from "react";
import Link from "next/link";
import { Award, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Lock, TicketCheck } from "lucide-react";

export interface LearningProgressPackage {
  id: string;
  title: string;
  accessLabel: string;
  totalModules: number;
  completedModules: number;
  certificateIssued: boolean;
}

export function LearningProgressCarousel({ packages }: { packages: LearningProgressPackage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const lastIndex = packages.length;
  const isEmptySlide = activeIndex === lastIndex;
  const currentPackage = packages[activeIndex];
  const percent = currentPackage?.totalModules
    ? Math.round((currentPackage.completedModules / currentPackage.totalModules) * 100)
    : 0;

  const goTo = (nextIndex: number) => setActiveIndex(Math.max(0, Math.min(lastIndex, nextIndex)));
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") goTo(activeIndex + 1);
    if (event.key === "ArrowLeft") goTo(activeIndex - 1);
  };
  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStart === null) return;
    const delta = touchStart - event.changedTouches[0].clientX;
    if (Math.abs(delta) > 45) goTo(activeIndex + (delta > 0 ? 1 : -1));
    setTouchStart(null);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Progress kelas">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
        <div>
          <p className="text-[10px] font-extrabold uppercase text-slate-500">Progress belajar</p>
          <h2 className="mt-0.5 text-base font-black text-slate-900">Kelas kamu</h2>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0} aria-label="Kelas sebelumnya" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => goTo(activeIndex + 1)} disabled={activeIndex >= lastIndex} aria-label="Kelas berikutnya" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      <div
        className="min-h-[180px] touch-pan-y px-4 py-5 sm:px-5"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
        aria-live="polite"
      >
        {isEmptySlide || !currentPackage ? (
          <div className="flex min-h-[140px] flex-col items-center justify-center text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Lock className="h-5 w-5" /></div>
            <h3 className="mt-3 text-sm font-extrabold text-slate-900">Belum ada kelas aktif lainnya</h3>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">Tukarkan kode kelas atau gabung komunitas untuk membuka jalur belajar berikutnya.</p>
            <Link href="/modulku#course-redeem-code" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:underline"><TicketCheck className="h-4 w-4" /> Lihat akses kelas</Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-extrabold uppercase text-sky-800">{currentPackage.accessLabel}</span>
                {currentPackage.certificateIssued && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800"><Award className="h-3 w-3" /> Sertifikat diraih</span>}
              </div>
              <h3 className="mt-2 text-lg font-black text-slate-900">{currentPackage.title}</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-black tabular-nums text-slate-900">{currentPackage.completedModules}</span>
                <span className="text-sm font-semibold text-slate-400">/ {currentPackage.totalModules} modul selesai</span>
                <span className="ml-auto text-sm font-black tabular-nums text-sky-800">{percent}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-600 to-lime-500 transition-[width] duration-500" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">{currentPackage.certificateIssued ? "Sertifikat kelas ini tersedia." : `Selesaikan seluruh ${currentPackage.totalModules} modul dan kuis untuk meraih sertifikat kelas.`}</p>
            </div>
            <Link href="/modulku" className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-700"><BookOpen className="h-4 w-4" /> Buka kelas</Link>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 px-4 py-2.5">
        {Array.from({ length: packages.length + 1 }, (_, index) => (
          <button key={index} type="button" aria-label={index === lastIndex ? "Info kelas berikutnya" : `Pilih ${packages[index]?.title || "kelas"}`} aria-current={activeIndex === index ? "step" : undefined} onClick={() => goTo(index)} className={`h-1.5 rounded-full transition-all ${activeIndex === index ? "w-6 bg-slate-800" : "w-1.5 bg-slate-300 hover:bg-slate-500"}`} />
        ))}
        <span className="ml-2 text-[10px] font-semibold tabular-nums text-slate-400">{activeIndex + 1}/{packages.length + 1}</span>
      </div>
    </section>
  );
}
