export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { CourseManager } from "@/components/admin/CourseManager";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export default async function AdminCoursesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/beranda");

  const courses = await prisma.learningCourse.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      redeemCodes: { orderBy: { createdAt: "desc" } },
      _count: { select: { modules: true, accessGrants: true, certificates: true } },
    },
  });

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-700" />
            <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Kelas & Akses</h1>
          </div>
        </div>
        <p className="max-w-3xl text-sm text-slate-600">
          Atur kelas, metode akses peserta, kode redeem, sertifikat, dan reward leaderboard. Pengelolaan materi serta kuis tersedia terpisah di Manajemen Modul.
        </p>
        <CourseManager initialCourses={courses} />
      </div>
    </AppShell>
  );
}