import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Lock,
  Lightbulb,
  Award,
  ArrowRight,
  FileText,
  HelpCircle,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { isModuleUnlocked } from "@/lib/modules/access";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Chapter {
  title: string;
  body: string;
  tip?: string;
}

interface ModuleContent {
  summary: string;
  chapters: Chapter[];
}

export default async function ModuleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const moduleItem = await prisma.module.findUnique({
    where: { id: params.id },
    include: {
      course: true,
      badge: true,
      progress: {
        where: { userId: user.id },
      },
    },
  });

  if (!moduleItem) {
    notFound();
  }

  const totalModules = await prisma.module.count({ where: { courseId: moduleItem.courseId } });

  if (!(await isModuleUnlocked(user.id, moduleItem.id))) {
    redirect("/modulku");
  }

  const userProgress = moduleItem.progress[0];
  const isCompleted = userProgress?.isCompleted ?? false;

  let parsedContent: ModuleContent = { summary: "", chapters: [] };
  try {
    parsedContent = JSON.parse(moduleItem.content);
  } catch {
    parsedContent = {
      summary: moduleItem.description,
      chapters: [
        {
          title: "Materi Pembelajaran",
          body: moduleItem.content,
        },
      ],
    };
  }

  return (
    <AppShell user={user}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Status Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/modulku"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Modulku</span>
          </Link>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              isCompleted
                ? "bg-emerald-100 text-emerald-800"
                : "bg-primary-light text-primary"
            }`}
          >
            {isCompleted ? "Modul Selesai (10/10)" : "Sedang Dipelajari"}
          </span>
        </div>

        {/* Title Card */}
        <Card className="border-slate-200/80 bg-white p-6 sm:p-8">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {moduleItem.course?.title || "Public Speaking I · Basic"} · Modul {moduleItem.order} dari {totalModules}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {moduleItem.title}
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            {moduleItem.subtitle}
          </p>
          {moduleItem.course && (
            <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-800">
              {moduleItem.course.accessMode === "COMMUNITY" ? "Akses anggota komunitas" : moduleItem.course.accessMode === "REDEEM_CODE" ? "Kelas premium" : "Kelas Basic"}
            </span>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-accent" />
              <span>Hadiah Badge: <strong>{moduleItem.badge?.name}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span>Syarat Lulus: Skor Kuis <strong>10/10</strong></span>
            </span>
          </div>
        </Card>

        {/* Summary Callout */}
        {parsedContent.summary && (
          <div className="bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-100 rounded-2xl p-5 text-sm text-slate-700 leading-relaxed font-medium">
            <span className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
              Ringkasan Inti
            </span>
            {parsedContent.summary}
          </div>
        )}

        {/* Structured Chapters */}
        <div className="space-y-6">
          {parsedContent.chapters.map((ch, idx) => (
            <Card key={idx} className="border-slate-200/80 p-6 sm:p-7 space-y-3">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                {ch.title}
              </h2>

              <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                {ch.body}
              </p>

              {ch.tip && (
                <div className="mt-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-amber-900">Tips Praktis: </span>
                    <span className="text-xs text-amber-800/90">{ch.tip}</span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {moduleItem.pdfUrl && (
          <Card className="border-slate-200/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Materi PDF</p>
                  <h3 className="mt-1 truncate text-base font-extrabold text-slate-900">{moduleItem.pdfTitle || "Panduan Modul"}</h3>
                </div>
              </div>
              <a href={moduleItem.pdfUrl} download className="inline-flex shrink-0 items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover">
                Unduh PDF
              </a>
            </div>
          </Card>
        )}

        {/* Bottom CTA to Take Quiz */}
        <Card className="bg-slate-900 text-white border-0 p-6 text-center space-y-4">
          <div>
            <h3 className="text-xl font-black">Sudah Siap Menguji Pemahamanmu?</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
              Jawab seluruh soal pilihan ganda dengan benar untuk lulus, meraih badge, dan membuka modul selanjutnya.
            </p>
          </div>

          <div className="flex justify-center">
            <Link href={`/modulku/${moduleItem.id}/quiz`}>
              <Button
                variant="accent"
                size="lg"
                className="px-8 shadow-lg shadow-amber-500/20"
              >
                <span>{isCompleted ? "Ulangi Kuis Modul" : "Mulai Kuis Modul"}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
