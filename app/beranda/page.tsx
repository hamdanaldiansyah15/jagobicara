export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Mic,
  BookOpen,
  FileText,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
  Users,
  Award,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { SeasonCountdown } from "@/components/leaderboard/SeasonCountdown";
import { CertificateVerifier } from "@/components/certificate/CertificateVerifier";
import { LearningProgressCarousel } from "@/components/dashboard/LearningProgressCarousel";
import { hasCourseAccess } from "@/lib/courses/access";
import {
  getCurrentSeasonName,
  getCurrentSeasonKey,
  getSeasonLeaderboard,
} from "@/lib/leaderboard/calculator";

export default async function BerandaPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [allModules, courses, certificate, courseCertificates] = await Promise.all([
    prisma.module.findMany({
      orderBy: [{ order: "asc" }],
      include: { course: true, progress: { where: { userId: user.id } } },
    }),
    prisma.learningCourse.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.certificate.findUnique({ where: { userId: user.id } }),
    prisma.courseCertificate.findMany({ where: { userId: user.id }, select: { courseId: true } }),
  ]);

  const modules = allModules.filter((module) => !module.courseId);
  const courseAccessEntries = await Promise.all(courses.map(async (course) => [
    course.id,
    await hasCourseAccess(user.id, course.id),
  ] as const));
  const courseAccess = new Map(courseAccessEntries);
  const learningProgressPackages = [
    {
      id: "public-speaking-one",
      title: "Public Speaking I",
      accessLabel: "BASIC",
      totalModules: modules.length,
      completedModules: modules.filter((module) => module.progress[0]?.isCompleted).length,
      certificateIssued: Boolean(certificate),
    },
    ...courses
      .filter((course) => courseAccess.get(course.id))
      .map((course) => {
        const classModules = allModules.filter((module) => module.courseId === course.id);
        return {
          id: course.id,
          title: course.title,
          accessLabel: course.accessMode === "COMMUNITY" ? "KOMUNITAS" : course.accessMode === "REDEEM_CODE" ? "PREMIUM" : "BASIC",
          totalModules: classModules.length,
          completedModules: classModules.filter((module) => module.progress[0]?.isCompleted).length,
          certificateIssued: courseCertificates.some((item) => item.courseId === course.id),
        };
      }),
  ];

  const completedCount = modules.filter(
    (m) => m.progress.length > 0 && m.progress[0].isCompleted
  ).length;

  // Fetch speaking stats
  const totalAttempts = await prisma.speakingAttempt.count({
    where: { userId: user.id, valid: true },
  });

  const bestAttempt = await prisma.speakingAttempt.findFirst({
    where: { userId: user.id, valid: true },
    orderBy: { finalScore: "desc" },
  });

  // Fetch leaderboard preview
  const seasonKey = getCurrentSeasonKey();
  const seasonName = getCurrentSeasonName();
  const communityId = user.community ? (await prisma.community.findUnique({ where: { code: user.community.code } }))?.id : undefined;

  const leaderboardPreview = await getSeasonLeaderboard({
    communityId: communityId,
    seasonKey,
    limit: 3,
  });

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Top Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Halo, {user.name} 👋
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Siap melatih kemampuan bicaramu hari ini?
            </p>
          </div>

          {user.community ? (
            <div className="inline-flex items-center gap-3 border-l-[3px] border-[#31584f] bg-white px-3 py-2 text-slate-700 self-start sm:self-auto">
              <Users className="h-4 w-4 text-[#31584f]" />
              <span>
                <span className="block text-[9px] font-bold uppercase text-slate-500">Komunitas terdaftar</span>
                <span className="block text-xs font-bold text-slate-900">{user.community.name}</span>
              </span>
            </div>
          ) : (
            <Link
              href="/akun"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs text-primary font-semibold hover:bg-indigo-100 transition-colors self-start sm:self-auto"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Gabung Komunitas</span>
            </Link>
          )}
        </div>

        {/* Two Main Action Cards: Bicara & Naskah */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main CTA: Mulai Bicara */}
          <div className="bg-gradient-to-br from-primary via-indigo-600 to-indigo-700 rounded-card p-6 text-white shadow-lg shadow-primary/20 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white mb-4">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Latihan 60 Detik
              </span>
              <h3 className="text-xl font-black mt-1">Mulai Bicara</h3>
              <p className="text-xs text-indigo-100 mt-1 leading-relaxed max-w-sm">
                Latih kemampuan public speaking-mu secara acak selama 60 detik dan dapatkan analisis 5 dimensi.
              </p>
            </div>

            <div className="mt-6 pt-2 relative z-10">
              <Link
                href="/bicara"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-primary font-bold text-sm shadow-md transition-all group-hover:gap-3"
              >
                <span>Mulai Latihan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Script Generator CTA */}
          <div className="bg-white rounded-card p-6 border border-slate-200/80 shadow-card flex flex-col justify-between relative group hover:border-slate-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-accent flex items-center justify-center mb-4 border border-amber-100">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Generator Instan
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">Buat Naskah</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-sm">
                Butuh bantuan menyusun naskah MC, kata sambutan, pemandu moderator, atau presentasi?
              </p>
            </div>

            <div className="mt-6 pt-2">
              <Link
                href="/naskah"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all"
              >
                <span>Buat Naskah Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <LearningProgressCarousel packages={learningProgressPackages} />

        {/* Learning Modules List Preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Alur Kelas Modul</h2>
              <p className="text-xs text-slate-500">Selesaikan kuis dengan skor 10/10 untuk membuka modul berikutnya</p>
            </div>
            <Link
              href="/modulku"
              className="text-xs font-bold text-primary hover:underline"
            >
              Buka Semua
            </Link>
          </div>

          <div className="space-y-2.5">
            {modules.map((m, idx) => {
              const userProgress = m.progress[0];
              const isCompleted = userProgress?.isCompleted;

              // Previous module must be completed to unlock
              const isUnlocked =
                idx === 0 ||
                (modules[idx - 1]?.progress[0]?.isCompleted ?? false);

              return (
                <Link
                  key={m.id}
                  href={isUnlocked ? `/modulku/${m.id}` : "#"}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isCompleted
                      ? "bg-emerald-50/50 border-emerald-200/80 hover:bg-emerald-50"
                      : isUnlocked
                      ? "bg-white border-slate-200/80 hover:border-primary/40 hover:shadow-sm"
                      : "bg-slate-50 border-slate-200/60 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isUnlocked
                          ? "bg-primary-light text-primary"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : m.order}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{m.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        Selesai
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[11px] font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">
                        Buka
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Terkunci</span>
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Certificate Banner (if unlocked) */}
        {modules.length > 0 && completedCount === modules.length && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-card p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-black text-base">Certificate of Completion Tersedia!</h4>
                <p className="text-xs text-amber-100 mt-0.5">
                  Kamu telah menyelesaikan seluruh {modules.length} modul. Unduh atau cetak sertifikatmu sekarang.
                </p>
              </div>
            </div>
            <Link
              href="/akun/sertifikat"
              className="px-5 py-2.5 bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs rounded-xl shadow-sm shrink-0 transition-colors"
            >
              Lihat Sertifikat
            </Link>
          </div>
        )}

        <CertificateVerifier />

        {/* Community Leaderboard Preview */}
        <Card className="border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Top Klasemen {user.community ? user.community.name : "Season Ini"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Poin latihan di {seasonName}
                </p>
              </div>
            </div>

            <Link
              href="/leaderboard"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>Lihat Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {leaderboardPreview.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              Belum ada skor latihan yang tercatat di season ini. Jadilah yang pertama!
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboardPreview.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-colors ${
                    entry.userId === user.id
                      ? "bg-indigo-50/80 border-indigo-200 font-semibold"
                      : "bg-slate-50/60 border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 text-center font-bold text-xs ${
                        entry.rank === 1
                          ? "text-amber-500 text-base"
                          : entry.rank === 2
                          ? "text-slate-400 text-base"
                          : entry.rank === 3
                          ? "text-amber-700 text-base"
                          : "text-slate-500"
                      }`}
                    >
                      {entry.rank === 1
                        ? "🥇"
                        : entry.rank === 2
                        ? "🥈"
                        : entry.rank === 3
                        ? "🥉"
                        : `#${entry.rank}`}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {entry.name} {entry.userId === user.id && "(Kamu)"}
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
          )}
        </Card>
      </div>
    </AppShell>
  );
}
