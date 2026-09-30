export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Award,
  ChevronRight,
  Users,
  KeyRound,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { RedeemCourseCodeForm } from "@/components/courses/RedeemCourseCodeForm";
import { hasCourseAccess } from "@/lib/courses/access";

export default async function ModulkuPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [modules, courses, userBadges, certificate, courseCertificates] = await Promise.all([
    prisma.module.findMany({
      orderBy: [{ order: "asc" }],
      include: {
        course: true,
        badge: true,
        questions: { select: { id: true } },
        progress: { where: { userId: user.id } },
      },
    }),
    prisma.learningCourse.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true },
    }),
    prisma.certificate.findUnique({ where: { userId: user.id } }),
    prisma.courseCertificate.findMany({
      where: { userId: user.id },
      include: { course: { select: { title: true } } },
      orderBy: { issueDate: "desc" },
    }),
  ]);

  const courseAccessEntries = await Promise.all(
    courses.map(async (course) => [course.id, await hasCourseAccess(user.id, course.id)] as const),
  );
  const courseAccess = new Map(courseAccessEntries);
  const freeModules = modules.filter((module) => !module.courseId).sort((a, b) => a.order - b.order);
  const coursePackages = [
    {
      id: null as string | null,
      title: "Public Speaking I",
      description: "Fondasi public speaking, teknik berbicara, struktur pesan, MC, dan improvisasi.",
      accessMode: "FREE" as const,
      isActive: true,
      leaderboardReward: false,
      rewardDurationDays: 30,
      modules: freeModules,
      hasAccess: true,
      certificate: certificate ? { certificateNumber: certificate.certificateNumber } : null,
    },
    ...courses.map((course) => ({
      ...course,
      modules: modules.filter((module) => module.courseId === course.id).sort((a, b) => a.order - b.order),
      hasAccess: courseAccess.get(course.id) === true,
      certificate: courseCertificates.find((item) => item.courseId === course.id) || null,
    })),
  ];
  const accessibleModules = coursePackages.filter((course) => course.hasAccess).flatMap((course) => course.modules);
  const earnedVisibleBadges = userBadges.filter((userBadge) =>
    accessibleModules.some((moduleItem) => moduleItem.id === userBadge.badge.moduleId)
  );

  const renderPackage = (course: (typeof coursePackages)[number], packageIndex: number) => {
    const completedCount = course.modules.filter((moduleItem) => moduleItem.progress[0]?.isCompleted).length;
    const issuedCertificate = Boolean(course.certificate);
    const accent = packageIndex === 0 ? "sky" : packageIndex % 2 === 1 ? "emerald" : "amber";
    const isPremiumLocked = !course.hasAccess;

    return (
      <section key={course.id || "public-speaking-one"} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className={`border-b px-5 py-5 sm:px-6 ${accent === "sky" ? "border-sky-200 bg-sky-50" : accent === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase ${accent === "sky" ? "text-sky-800" : accent === "emerald" ? "text-emerald-800" : "text-amber-800"}`}>
                  {course.id === null ? "PAKET BASIC" : `PAKET ${packageIndex + 1}`}
                </span>
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                  {course.accessMode === "FREE" ? "Basic" : course.accessMode === "COMMUNITY" ? "Akses komunitas" : "Premium"}
                </span>
                {issuedCertificate && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">Sertifikat diraih</span>}
              </div>
              <h2 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">{course.title}</h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600">{course.description}</p>
            </div>
            <div className="flex shrink-0 items-center gap-4 sm:text-right">
              <div>
                <p className="text-xl font-black tabular-nums text-slate-900">{course.hasAccess ? `${completedCount}/${course.modules.length}` : course.modules.length}</p>
                <p className="text-[10px] font-semibold text-slate-500">{course.hasAccess ? "modul selesai" : "modul di dalam paket"}</p>
              </div>
              {isPremiumLocked ? <Lock className="h-6 w-6 text-slate-500" /> : <BookOpen className="h-6 w-6 text-slate-500" />}
            </div>
          </div>
          {course.hasAccess && course.modules.length > 0 && (
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/80">
              <div className={`h-full rounded-full ${accent === "sky" ? "bg-sky-600" : accent === "emerald" ? "bg-emerald-600" : "bg-amber-600"}`} style={{ width: `${Math.round((completedCount / course.modules.length) * 100)}%` }} />
            </div>
          )}
        </div>

        {isPremiumLocked ? (
          <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-sm font-bold text-slate-800">Paket ini belum terbuka</p>
              <p className="mt-1 text-xs text-slate-500">
                {course.accessMode === "COMMUNITY"
                  ? "Bergabung dengan komunitas untuk mendapat akses kelas ini."
                  : course.leaderboardReward
                  ? `Tukarkan kode atau raih 3 besar leaderboard untuk akses ${course.rewardDurationDays} hari.`
                  : "Tukarkan kode kelas untuk membuka semua modul dan kuis di paket ini."}
              </p>
            </div>
            {course.accessMode === "COMMUNITY" ? (
              <Link href="/akun/komunitas" className="inline-flex shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100">Gabung komunitas</Link>
            ) : (
              <a href="#course-redeem-code" className="inline-flex shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100">Punya kode? Tukarkan</a>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 px-4 sm:px-6">
            {course.modules.map((moduleItem, index) => {
              const completed = moduleItem.progress[0]?.isCompleted ?? false;
              const previousCompleted = index === 0 || course.modules[index - 1]?.progress[0]?.isCompleted === true;
              const unlocked = previousCompleted;
              const hasBadge = userBadges.some((userBadge) => userBadge.badge.moduleId === moduleItem.id);

              return (
                <div key={moduleItem.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black ${completed ? "bg-emerald-600 text-white" : unlocked ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>
                      {completed ? <CheckCircle2 className="h-5 w-5" /> : moduleItem.order}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900">{moduleItem.title}</h3>
                        {completed && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">SELESAI</span>}
                        {!completed && !unlocked && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">TERKUNCI</span>}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{moduleItem.description}</p>
                      <p className="mt-1 text-[10px] text-slate-400">Kuis {moduleItem.questions?.length ?? 0} soal{moduleItem.badge ? ` · Badge: ${moduleItem.badge.name}` : ""}{hasBadge ? " · Badge diraih" : ""}</p>
                    </div>
                  </div>
                  {unlocked ? (
                    <Link href={`/modulku/${moduleItem.id}`} className={`inline-flex shrink-0 items-center justify-center gap-2 self-end rounded-lg px-4 py-2 text-xs font-bold sm:self-auto ${completed ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "bg-slate-900 text-white hover:bg-slate-700"}`}>
                      {completed ? "Ulang materi" : "Mulai modul"}<ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1.5 self-end rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-semibold text-slate-500 sm:self-auto"><Lock className="h-3 w-3" />Selesaikan modul sebelumnya</span>
                  )}
                </div>
              );
            })}
            {course.modules.length === 0 && <p className="py-5 text-xs text-slate-500">Materi kelas ini sedang disiapkan.</p>}
            <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs">
              <span className="font-semibold text-slate-600">Sertifikat paket</span>
              {issuedCertificate ? (
                <Link href="/akun/sertifikat" className="font-bold text-emerald-700 hover:underline">Terbit · {course.certificate!.certificateNumber}</Link>
              ) : course.modules.length > 0 ? (
                <span className="text-slate-500">Selesaikan semua kuis dengan skor 10/10</span>
              ) : (
                <span className="text-slate-400">Belum ada modul</span>
              )}
            </div>
          </div>
        )}
      </section>
    );
  };

  const badgeModules = coursePackages.filter((course) => course.hasAccess).flatMap((course) => course.modules);

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="space-y-2 border-b border-slate-200 pb-5">
          <p className="text-xs font-bold uppercase text-sky-700">Jalur Belajar</p>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Paket Kelas Public Speaking</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">Public Speaking I Basic tersedia untuk semua. Kelas lanjutan dapat terbuka melalui keanggotaan komunitas, kode akses, atau reward leaderboard.</p>
        </header>

        {coursePackages.map((course, index) => renderPackage(course, index))}

        <RedeemCourseCodeForm />

        <section className="space-y-3 border-t border-slate-200 pt-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-900">Badge kelas yang terbuka</h2>
              <p className="mt-1 text-xs text-slate-500">Badge kelas premium akan muncul otomatis setelah paketnya dapat diakses.</p>
            </div>
            <span className="text-xs font-bold text-slate-600">{earnedVisibleBadges.length}/{badgeModules.length} diraih</span>
          </div>
          {badgeModules.length ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {badgeModules.map((moduleItem) => {
                const hasBadge = userBadges.some((userBadge) => userBadge.badge.moduleId === moduleItem.id);
                return (
                  <div key={moduleItem.id} className={`border p-3 ${hasBadge ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
                    <Award className={`mb-2 h-5 w-5 ${hasBadge ? "text-amber-700" : "text-slate-300"}`} />
                    <p className="line-clamp-2 text-xs font-bold text-slate-800">{moduleItem.badge?.name || `${moduleItem.title} Selesai`}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{hasBadge ? "Diraih" : "Selesaikan kuis untuk meraih"}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Belum ada badge untuk kelas yang terbuka.</p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
