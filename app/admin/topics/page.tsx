export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export default async function AdminTopicsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/beranda");

  const topics = await prisma.speakingTopic.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AppShell user={user}>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Topics</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {topics.map((topic) => (
            <Card key={topic.id} className="border-slate-200/80 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-900">{topic.title}</h2>
                <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${topic.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                  {topic.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{topic.prompt}</p>
              <p className="mt-2 text-xs text-slate-500">Kategori: {topic.category}</p>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
