"use client";

import { ReactNode, TouchEvent, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenCheck, Mic2, UsersRound } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";

const tourSlides = [
  {
    eyebrow: "JAGO BICARA",
    title: "Punya ide?\nSampaikan dengan yakin.",
    description: "Latihan singkat untuk menyusun pikiran dan menyampaikan gagasan dengan percaya diri.",
    accent: "#FFF7ED",
    foreground: "#431407",
    icon: Mic2,
    visual: "voice",
    label: "Mulai dari 60 detik.",
  },
  {
    eyebrow: "MULAI DARI YANG KECIL",
    title: "Bukan kurang pintar.\nKadang hanya kurang latihan.",
    description: "Gugup, kehilangan kata, atau bingung mulai dari mana itu wajar. Kemampuan bicara tumbuh dari latihan yang terarah.",
    accent: "#ffd2a8",
    foreground: "#542d1a",
    icon: BookOpenCheck,
    visual: "practice",
    label: "Satu latihan. Satu langkah maju.",
  },
  {
    eyebrow: "BERTUMBUH BERSAMA",
    title: "Latihan nyata,\nkemajuan yang terasa.",
    description: "Pelajari modul, coba latihan bicara 60 detik, susun naskah, dan bertumbuh bersama komunitasmu.",
    accent: "#DCEAF7",
    foreground: "#172B4D",
    icon: UsersRound,
    visual: "community",
    label: "Temukan suara. Bagikan gagasan.",
  },
];

export function FirstVisitTour({ children }: { children: ReactNode }) {
  const [isComplete, setIsComplete] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const finishTour = () => setIsComplete(true);

  const nextSlide = () => {
    if (activeSlide === tourSlides.length - 1) finishTour();
    else setActiveSlide((current) => current + 1);
  };

  const previousSlide = () => setActiveSlide((current) => Math.max(0, current - 1));

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartX === null) return;
    const distance = touchStartX - event.changedTouches[0].clientX;
    if (Math.abs(distance) > 55) {
      if (distance > 0) nextSlide();
      else previousSlide();
    }
    setTouchStartX(null);
  };

  if (isComplete) return <>{children}</>;

  const slide = tourSlides[activeSlide];
  const SlideIcon = slide.icon;

  return (
    <main
      className="min-h-screen overflow-hidden bg-[#FFF7ED] text-[#172624]"
      onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-5 pt-5 sm:px-8 sm:pb-8 sm:pt-7">
        <header className="flex items-center justify-between">
          <BrandLogo className="h-14 max-w-[220px] sm:h-16" priority />
          <button type="button" onClick={finishTour} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-white/70 hover:text-slate-900">Lewati</button>
        </header>

        <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14" key={activeSlide}>
          <div className="order-2 max-w-xl animate-in fade-in slide-in-from-bottom-3 duration-500 lg:order-1">
            <p className="text-xs font-extrabold uppercase tracking-normal text-[#3d756b]">{slide.eyebrow}</p>
            <h1 className="mt-4 whitespace-pre-line text-4xl font-black leading-[1.06] sm:text-5xl lg:text-6xl">{slide.title}</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#52645f] sm:text-lg">{slide.description}</p>
            <p className="mt-6 text-sm font-bold text-[#274b43]">{slide.label}</p>
          </div>

          <div className="order-1 flex min-h-[270px] items-center justify-center lg:order-2 lg:min-h-[500px]" aria-hidden="true">
            <div className="relative flex aspect-[1.18/1] w-full max-w-[620px] items-center justify-center overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]" style={{ backgroundColor: slide.accent, color: slide.foreground }}>
              {slide.visual !== "voice" && (
                <>
                  <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full border-[1px] border-current/15 sm:h-80 sm:w-80" />
                  <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full border-[1px] border-current/15 sm:h-96 sm:w-96" />
                </>
              )}

              {slide.visual === "voice" && (
                <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F97316] text-white sm:h-24 sm:w-24">
                    <SlideIcon className="h-9 w-9 sm:h-10 sm:w-10" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-[#9A3412]">Latihan bicara</p>
                    <p className="mt-1 font-mono text-5xl font-black leading-none sm:text-6xl">60</p>
                    <p className="mt-1 text-sm font-semibold">detik untuk memulai</p>
                  </div>
                </div>
              )}

              {slide.visual === "practice" && (
                <div className="relative w-[78%] max-w-[410px]">
                  <div className="relative space-y-3 rounded-2xl border border-[#542d1a]/15 bg-[#fff8f0]/85 p-5 shadow-xl sm:space-y-4 sm:p-8">
                    <div className="flex items-center justify-between border-b border-[#542d1a]/10 pb-3"><span className="text-xs font-black uppercase">Latihan hari ini</span><span className="rounded-full bg-[#f2bc87] px-2.5 py-1 text-[10px] font-bold">60 DETIK</span></div>
                    <p className="text-xl font-extrabold leading-snug sm:text-2xl">Ceritakan satu hal yang ingin kamu ubah.</p>
                    <div className="flex items-center gap-3 pt-1"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#542d1a] text-white"><Mic2 className="h-5 w-5" /></span><div className="flex h-8 flex-1 items-center gap-1">{Array.from({ length: 24 }, (_, item) => <span key={item} className="flex-1 rounded-full bg-[#c17b4c]/70" style={{ height: `${8 + ((item * 17) % 24)}px` }} />)}</div></div>
                  </div>
                </div>
              )}

              {slide.visual === "community" && (
                <div className="relative flex w-[82%] max-w-[440px] flex-col items-center">
                  <div className="relative flex h-28 w-full items-center justify-center sm:h-40">
                    {[
                      { x: "left-[8%]", y: "top-8", tone: "bg-[#C2410C]", size: "h-14 w-14 sm:h-20 sm:w-20", delay: "delay-75" },
                      { x: "left-[32%]", y: "top-0", tone: "bg-[#0EA5E9]", size: "h-20 w-20 sm:h-28 sm:w-28", delay: "delay-150" },
                      { x: "right-[8%]", y: "top-8", tone: "bg-[#B45309]", size: "h-14 w-14 sm:h-20 sm:w-20", delay: "delay-300" },
                    ].map((person, index) => <div key={index} className={`absolute ${person.x} ${person.y} ${person.size} ${person.tone} ${person.delay} flex items-center justify-center rounded-full border-4 border-[#DCEAF7] text-white shadow-lg`}><UsersRound className="h-7 w-7 sm:h-9 sm:w-9" /></div>)}
                  </div>
                  <div className="mt-3 w-full rounded-2xl bg-[#172B4D] p-4 text-white shadow-xl sm:mt-5 sm:p-6">
                    <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase text-[#B9DDF2]">Ruang komunitas</span><span className="text-xs font-semibold text-[#FFD2A8]">Bertumbuh bersama</span></div>
                    <p className="mt-3 text-base font-extrabold sm:text-xl">Setiap suara punya ruang.</p>
                    <div className="mt-3 flex gap-1.5"><span className="h-1.5 w-1/3 rounded-full bg-[#38BDF8]"/><span className="h-1.5 w-1/3 rounded-full bg-[#F97316]"/><span className="h-1.5 w-1/3 rounded-full bg-[#FBBF24]"/></div>
                  </div>
                </div>
              )}

              <div className="absolute bottom-7 right-7 text-xs font-bold sm:bottom-10 sm:right-10">BELAJAR · BERLATIH · BERTUMBUH</div>
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between gap-4 border-t border-primary/15 pt-4">
          <div className="flex items-center gap-2" aria-label={`Slide ${activeSlide + 1} dari 3`}>
            {tourSlides.map((item, index) => (
              <button key={item.eyebrow} type="button" aria-label={`Buka slide ${index + 1}`} aria-current={activeSlide === index ? "step" : undefined} onClick={() => setActiveSlide(index)} className={`h-2.5 rounded-full transition-all ${activeSlide === index ? "w-9 bg-primary" : "w-2.5 bg-primary/25 hover:bg-primary/50"}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {activeSlide > 0 && <button type="button" onClick={previousSlide} aria-label="Slide sebelumnya" className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 text-primary hover:bg-white"><ArrowLeft className="h-5 w-5" /></button>}
            {activeSlide < tourSlides.length - 1 ? (
              <button type="button" onClick={nextSlide} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover">Lanjut <ArrowRight className="h-4 w-4" /></button>
            ) : (
              <button type="button" onClick={finishTour} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover">Lihat halaman utama <ArrowRight className="h-4 w-4" /></button>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}
