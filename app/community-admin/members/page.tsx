export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export default async function CommunityAdminMembersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "COMMUNITY_ADMIN") redirect("/beranda");

  const communityMember = await prisma.communityMember.findFirst({
    where: { userId: user.id },
    include: { community: true },
  });

  if (!communityMember) redirect("/beranda");

  const members = await prisma.communityMember.findMany({
    where: { communityId: communityMember.communityId },
    include: { user: { include: { speakingAttempts: { where: { valid: true }, orderBy: { finalScore: "desc" } } } } },
  });

  return (
    <AppShell user={user}>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/community-admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Daftar Anggota Komunitas</h1>
        </div>

        <Card className="border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">Nama</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Email</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">WhatsApp</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Best Score</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const bestScore = member.user.speakingAttempts[0]?.finalScore ?? 0;
                  return (
                    <tr key={member.id} className="border-t border-slate-200">
                      <td className="px-4 py-3 font-medium text-slate-800">{member.user.name}</td>
                      <td className="px-4 py-3 text-slate-600">{member.user.email}</td>
                      <td className="px-4 py-3 text-slate-600">{member.user.whatsapp}</td>
                      <td className="px-4 py-3 text-slate-800 font-semibold">{bestScore}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">Aktif</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
