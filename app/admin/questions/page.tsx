export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export default async function AdminQuestionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/beranda");

  const questions = await prisma.quizQuestion.findMany({
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
    include: { module: true },
  });

  return (
    <AppShell user={user}>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Questions</h1>
        </div>

        <div className="space-y-3">
          {questions.map((question) => (
            <Card key={question.id} className="border-slate-200/80 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">{question.module.title}</p>
              <h2 className="mt-2 text-base font-bold text-slate-900">{question.question}</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
                <span>A. {question.optionA}</span>
                <span>B. {question.optionB}</span>
                <span>C. {question.optionC}</span>
                <span>D. {question.optionD}</span>
              </div>
              <p className="mt-3 text-xs text-emerald-700">Jawaban benar: {question.correctAnswer}</p>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
