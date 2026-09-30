export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export default async function AdminTemplatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/beranda");

  const templates = await prisma.scriptTemplate.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AppShell user={user}>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Script Templates</h1>
        </div>

        <div className="space-y-3">
          {templates.map((template) => (
            <Card key={template.id} className="border-slate-200/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-900">{template.name}</h2>
                <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">{template.type}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{template.description}</p>
              <p className="mt-2 text-xs text-slate-500">Kategori: {template.category}</p>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
