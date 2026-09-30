export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CommunitySettingsForm } from "@/components/community-admin/CommunitySettingsForm";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export default async function CommunitySettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "COMMUNITY_ADMIN") redirect("/beranda");

  const membership = await prisma.communityMember.findFirst({
    where: { userId: user.id },
    include: { community: true },
  });
  if (!membership) redirect("/beranda");

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/community-admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Pengaturan Komunitas</h1>
        </div>
        <CommunitySettingsForm initialSettings={{
          communityName: membership.community.name,
          address: membership.community.address || "",
          code: membership.community.code,
          adminName: user.name,
          email: user.email,
          phone: user.whatsapp,
        }} />
      </div>
    </AppShell>
  );
}
