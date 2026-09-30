export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import {
  Mic,
  BookOpen,
  FileText,
  Trophy,
  Award,
  Users,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { PwaInstallButton } from "@/components/landing/PwaInstallButton";
import { BrandLogo } from "@/components/layout/BrandLogo";

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === "SUPER_ADMIN") redirect("/admin");
    if (user.role === "COMMUNITY_ADMIN") redirect("/community-admin");
    redirect("/beranda");
  }

  const features = [
    {
      icon: Mic,
      title: "Bicara 60 Detik",
      desc: "Latih kemampuan berbicara secara teratur dengan topik acak dan evaluasi dimensi kelancaran, struktur, serta kosakata.",
      badge: "Fitur Utama",
      color: "bg-orange-50 text-primary border-orange-100",
    },
    {
      icon: BookOpen,
      title: "5 Modul Bertahap",
      desc: "Kurikulum terstruktur dari dasar percaya diri, teknik vokal, arsitektur pidato, MC, hingga improvisasi dengan kuis 10/10.",
      badge: "Struktur Belajar",
      color: "bg-sky-50 text-secondary border-sky-100",
    },
    {
      icon: FileText,
      title: "Generator Naskah",
      desc: "Susun naskah MC, kata sambutan, pemandu moderator, dan pidato secara instan dan dapat disesuaikan tanpa AI berbayar.",
      badge: "Praktis & Siap Pakai",
      color: "bg-amber-50 text-accent border-amber-100",
    },
    {
      icon: Trophy,
      title: "Leaderboard Komunitas",
      desc: "Peringkat bulanan dari nilai latihan terbaik dikalikan jumlah latihan valid. Bangun konsistensi dan tumbuh bersama komunitas.",
      badge: "Motivasi Bulanan",
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
  ];

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col selection:bg-orange-100">
      {/* Top Header */}
      <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" aria-label="Jago Bicara" className="flex shrink-0 items-center">
            <BrandLogo className="h-14 max-w-[220px] sm:h-16" priority />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all"
            >
              Mulai Belajar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <p className="mx-auto mb-6 max-w-full text-sm font-semibold leading-snug text-slate-600 sm:text-base">
          Platform Latihan Public Speaking Generasi Muda
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Belajar. Berlatih. <br />
          <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Berani Bicara.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Platform latihan public speaking berbasis komunitas untuk membantu kamu lebih percaya diri, terstruktur dalam berpikir, dan berani menyampaikan ide di depan publik.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-3xl mx-auto">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
          >
            <span>Mulai Belajar Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-base transition-colors"
          >
            Masuk ke Akun
          </Link>
          <PwaInstallButton />
        </div>

        {/* Hero Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>100% Gratis & Ramah Pemula</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>PWA Siap Pasang di Smartphone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Certificate of Completion Resmi</span>
          </div>
        </div>
      </section>

      {/* 4 Core Concepts Grid */}
      <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Semua yang Kamu Butuhkan untuk Jago Bicara
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
            Metode holistik yang menggabungkan teori praktis, latihan rekaman mikrofon 60 detik, dan dukungan komunitas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-card p-6 border border-slate-100 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${f.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {f.badge}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{f.title}</h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed font-normal">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works / Alur Belajar */}
      <section className="py-16 bg-white border-y border-slate-200/80 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-primary tracking-widest uppercase">
              Cara Kerja
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Alur Belajar & Bertumbuh di JAGO BICARA
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary font-black text-lg flex items-center justify-center mb-4 shadow-sm">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900">Pelajari Modul Bertahap</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Buka 5 modul interaktif, baca materi padat tips praktis, dan buktikan pemahamanmu dengan meraih skor kuis 10/10.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-secondary font-black text-lg flex items-center justify-center mb-4 shadow-sm">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900">Latihan Bicara 60 Detik</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Dapatkan topik spontan secara acak, rekam suaramu selama 60 detik, dan dapatkan evaluasi 5 dimensi beserta saran perbaikan.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-accent font-black text-lg flex items-center justify-center mb-4 shadow-sm">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900">Raih Badge & Sertifikat</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Koleksi 5 badge pencapaian, bersaing sehat di leaderboard komunitas, dan terbitkan Certificate of Completion resmi beridentitas unik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certificate Preview Banner */}
      <section className="py-14 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-card p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold mb-4">
              <Award className="w-4 h-4" />
              <span>Sertifikasi Penyelesaian Program</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dapatkan Certificate of Completion Resmi
            </h3>
            <p className="mt-3 text-sm text-indigo-100/90 leading-relaxed">
              Setelah menuntaskan seluruh 5 modul dan kuis dengan nilai sempurna (10/10), sistem akan secara otomatis menerbitkan sertifikat digital dengan nomor verifikasi unik yang dapat kamu unduh dan cetak.
            </p>
            <div className="mt-6">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-sm shadow-md transition-all"
              >
                <span>Daftar Sekarang & Raih Sertifikat</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 py-8 px-4 sm:px-6 bg-white text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
            <BrandLogo className="h-12 max-w-[180px] sm:h-14" />
            <span className="text-slate-400">— Belajar. Berlatih. Berani Bicara.</span>
          </div>
          <p>© 2026 JAGO BICARA. Inisiasi Pembelajaran Komunikasi Pemuda Indonesia.</p>
        </div>
      </footer>
    </div>
  );
}
