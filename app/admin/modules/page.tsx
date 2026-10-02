export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleManager } from "@/components/admin/ModuleManager";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export default async function AdminModulesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/beranda");

  const [modules, courses] = await Promise.all([
    prisma.module.findMany({
      orderBy: [{ courseId: "asc" }, { order: "asc" }],
      include: { badge: true, questions: true },
    }),
    prisma.learningCourse.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        redeemCodes: { orderBy: { createdAt: "desc" } },
        _count: { select: { modules: true } },
      },
    }),
  ]);

  return (
    <AppShell user={user}>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Modul & Kuis</h1>
        </div>

        <ModuleManager courses={courses} initialModules={modules.map((module) => ({
          id: module.id,
          title: module.title,
          subtitle: module.subtitle,
          description: module.description,
          content: module.content,
          order: module.order,
          courseId: module.courseId,
          pdfTitle: module.pdfTitle,
          pdfUrl: module.pdfUrl,
          questions: module.questions,
        }))} />
      </div>
    </AppShell>
  );
}
