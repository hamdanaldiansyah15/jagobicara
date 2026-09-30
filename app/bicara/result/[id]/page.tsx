import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Trophy,
  RotateCcw,
  Home,
  CheckCircle2,
  MessageSquareText,
  BarChart3,
  Calendar,
  Clock,
  Info,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function getTranscriptDiff(original: string, corrected: string) {
  const originalTokens = original.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*|[^\p{L}\p{N}]+/gu) || [];
  const correctedWords = corrected.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || [];
  let correctedIndex = 0;

  return originalTokens.map((text, index) => {
    const isWord = /[\p{L}\p{N}]/u.test(text);
    if (!isWord) return { text, removed: false, key: index };

    const matchesNext = correctedWords[correctedIndex]?.toLocaleLowerCase("id-ID") === text.toLocaleLowerCase("id-ID");
    if (matchesNext) correctedIndex += 1;
    return { text, removed: !matchesNext, key: index };
  });
}

export default async function BicaraResultPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const attempt = await prisma.speakingAttempt.findUnique({
    where: { id: params.id },
  });

  if (!attempt) {
    notFound();
  }
  if (attempt.userId !== user.id && user.role !== "SUPER_ADMIN") {
    notFound();
  }

  const dimensionNotes = JSON.parse(attempt.dimensionNotes || "{}") as Record<string, string>;
  const suggestedAdditions = JSON.parse(attempt.suggestedAdditions || "[]") as string[];

  const dimensions = [
    {
      key: "fluency",
      label: "Kelancaran",
      score: attempt.fluency,
      desc: attempt.wordsPerMinute > 0
        ? `Tempo ${attempt.wordsPerMinute} kata/menit. ${attempt.fillerCount} filler dan ${attempt.repetitionCount} kata berulang/berlebih terdeteksi.`
        : "Tempo dan kata pengisi belum dapat dinilai dari transkrip.",
      color: "from-blue-500 to-indigo-600",
    },
    {
      key: "ideaDev",
      label: "Pengembangan Ide",
      score: attempt.ideaDev,
      desc: `${attempt.wordCount} kata dalam ${attempt.duration} detik; panjang transkrip dan kalimat berkontribusi pada skor ini.`,
      color: "from-indigo-500 to-purple-600",
    },
    {
      key: "relevance",
      label: "Relevansi Topik",
      score: attempt.relevance,
      desc: "Dihitung dari kecocokan kata isi transkrip dengan kata kunci judul dan prompt topik.",
      color: "from-sky-500 to-blue-600",
    },
    {
      key: "structure",
      label: "Struktur",
      score: attempt.structure,
      desc: "Penanda pembuka, transisi, dan penutup diperiksa secara eksplisit pada transkrip.",
      color: "from-emerald-500 to-teal-600",
    },
    {
      key: "vocabulary",
      label: "Penggunaan Kata",
      score: attempt.vocabulary,
      desc: "Keragaman kata isi dihitung setelah kata umum disaring; filler dan pengulangan mengurangi skor.",
      color: "from-amber-500 to-orange-600",
    },
  ];
  const transcriptDiff = getTranscriptDiff(attempt.transcript, attempt.correctedTranscript);

  return (
    <AppShell user={user}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{attempt.valid ? "Latihan Selesai" : "Belum Memenuhi Syarat"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hasil Latihan Bicaramu
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Topik: &ldquo;{attempt.topicTitle}&rdquo;
          </p>
        </div>

        {/* Big Public Speaking Score Card */}
        <Card className="text-center py-8 px-6 bg-gradient-to-b from-white to-slate-50 border-slate-200/80 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Public Speaking Score
          </span>

          <div className="my-4 flex items-baseline justify-center gap-1">
            <span className="text-6xl font-black text-primary tracking-tight">
              {attempt.finalScore}
            </span>
            <span className="text-2xl font-bold text-slate-400">/ 100</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>{attempt.valid ? "Evaluasi berbasis transkrip" : "Belum memenuhi syarat penilaian"} (Durasi: {attempt.duration} detik)</span>
          </div>
          <p className="mx-auto mt-3 max-w-lg text-xs text-slate-600">Skor dasar: isi 70% + durasi 30%, lalu dikalikan faktor tempo 85–100% berdasarkan kata/menit. Durasi di bawah 15 detik mendapat nilai 0.</p>
        </Card>

        <Card className="border-slate-200/80 p-5">
          <h3 className="text-base font-extrabold text-slate-900">Ringkasan Bicara</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Jumlah kata", value: attempt.wordCount },
              { label: "Kata per menit", value: attempt.wordsPerMinute },
              { label: "Filler", value: attempt.fillerCount },
              { label: "Pengulangan", value: attempt.repetitionCount },
            ].map((metric) => (
              <div key={metric.label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-[11px] font-medium text-slate-500">{metric.label}</p>
                <p className="mt-1 text-xl font-black text-slate-900">{metric.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
            <span>Kontribusi durasi dari 60 detik</span>
            <strong>{attempt.durationScore}/100</strong>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-sky-600" style={{ width: `${attempt.durationScore}%` }} />
          </div>
        </Card>

        {/* 5 Dimension Scores */}
        <Card className="border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-extrabold text-base text-slate-900">
              Rincian 5 Dimensi Penilaian
            </h3>
          </div>

          <div className="space-y-4">
            {dimensions.map((dim, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{dim.label}</span>
                  <span className="font-black text-slate-900">{dim.score} / 100</span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${dim.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-normal">{dimensionNotes[dim.key] || dim.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-slate-200/80 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-extrabold text-slate-900">Transkrip & Evaluasi Teks</h3>
            <span className="text-[11px] text-slate-500">Transkripsi browser dapat keliru; hasil ucapan asli ditampilkan untuk diperiksa.</span>
          </div>
          {attempt.transcript ? (
            <>
              <div className="mt-4">
                <p className="mb-2 text-xs font-bold text-slate-700">Ucapan asli <span className="font-normal text-red-600">(merah = disarankan dihapus)</span></p>
                <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700">
                  {transcriptDiff.map((part) => part.removed
                    ? <del key={part.key} className="rounded bg-red-100 px-0.5 text-red-800 decoration-red-600">{part.text}</del>
                    : <React.Fragment key={part.key}>{part.text}</React.Fragment>)}
                </p>
              </div>
              <div className="mt-4">
                <p className="mb-2 text-xs font-bold text-slate-700">Versi dirapikan <span className="font-normal text-emerald-700">(kata yang dipertahankan)</span></p>
                <p className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 text-sm leading-7 text-slate-800">{attempt.correctedTranscript || "Belum ada kata yang dapat dirapikan."}</p>
              </div>
              {suggestedAdditions.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold text-slate-700">Usulan tambahan <span className="font-normal text-emerald-700">(hijau = ide untuk ditambahkan)</span></p>
                  <div className="flex flex-wrap gap-2">{suggestedAdditions.map((suggestion) => <span key={suggestion} className="rounded-lg border border-emerald-200 bg-emerald-100 px-3 py-2 text-sm text-emerald-900">{suggestion}</span>)}</div>
                </div>
              )}
            </>
          ) : (
            <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Tidak ada transkrip ucapan untuk sesi ini. Penilaian berbasis kata tidak dapat dilakukan.</p>
          )}
        </Card>

        {/* Feedback Card */}
        <Card className="border-indigo-100 bg-indigo-50/40 p-6 space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <MessageSquareText className="w-4 h-4 text-primary" />
            <span>Umpan Balik (Feedback) Konstruktif</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {attempt.feedback}
          </p>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link href="/bicara" className="w-full sm:flex-1">
            <Button variant="primary" size="lg" className="w-full shadow-md shadow-primary/20">
              <RotateCcw className="w-4 h-4 mr-2" />
              <span>Coba Lagi (Topik Baru)</span>
            </Button>
          </Link>

          <Link href="/beranda" className="w-full sm:flex-1">
            <Button variant="outline" size="lg" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              <span>Kembali ke Beranda</span>
            </Button>
          </Link>

          <Link href="/leaderboard" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" className="w-full text-amber-600 hover:bg-amber-50">
              <Trophy className="w-4 h-4 mr-2 text-accent" />
              <span>Leaderboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
