export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { CommunityCreator } from "@/components/admin/CommunityCreator";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export default async function AdminCommunitiesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/beranda");

  const communities = await prisma.community.findMany({
    orderBy: { createdAt: "desc" },
    include: { members: { include: { user: true } } },
  });

  return (
    <AppShell user={user}>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Komunitas</h1>
        </div>

        <CommunityCreator />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {communities.map((community) => (
            <Card key={community.id} className="border-slate-200/80 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-900">{community.name}</h2>
                <span className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-700">{community.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{community.description ?? "Tidak ada deskripsi"}</p>
              <p className="mt-2 text-sm text-slate-600">{community.address ?? "Alamat belum diisi"}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Kode: <strong className="text-slate-700">{community.code}</strong></span>
                <span>Anggota: {community.members.length}</span>
              </div>
              {community.members.filter((member) => member.user.role === "COMMUNITY_ADMIN").map((member) => (
                <p key={member.id} className="mt-2 truncate text-xs text-slate-500">Admin: {member.user.name} · {member.user.email} · {member.user.whatsapp}</p>
              ))}
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
