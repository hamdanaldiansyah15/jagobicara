export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/passwords";
import prisma from "@/lib/db/prisma";

const settingsSchema = z.object({
  adminName: z.string().trim().min(2, "Nama admin minimal 2 karakter"),
  email: z.string().trim().email("Format email tidak valid"),
  phone: z.string().trim().min(8, "Nomor telepon minimal 8 digit").max(20),
  password: z.string().max(72).optional().or(z.literal("")),
  communityName: z.string().trim().min(3, "Nama komunitas minimal 3 karakter"),
  address: z.string().trim().min(5, "Alamat komunitas wajib diisi"),
  code: z.string().trim().min(4).max(24).regex(/^[A-Za-z0-9-]+$/, "Kode hanya boleh berisi huruf, angka, atau tanda hubung"),
});

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "COMMUNITY_ADMIN") {
      return NextResponse.json({ error: "Hanya admin komunitas yang dapat memperbarui pengaturan ini." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data pengaturan tidak valid." }, { status: 400 });
    }

    if (parsed.data.password && parsed.data.password.length < 8) {
      return NextResponse.json({ error: "Password baru minimal 8 karakter." }, { status: 400 });
    }

    const membership = await prisma.communityMember.findFirst({
      where: { userId: user.id },
      select: { communityId: true },
    });
    if (!membership) return NextResponse.json({ error: "Akun ini belum terhubung ke komunitas." }, { status: 404 });

    const email = parsed.data.email.toLowerCase();
    const code = parsed.data.code.toUpperCase();
    const [emailOwner, codeOwner] = await Promise.all([
      prisma.user.findUnique({ where: { email }, select: { id: true } }),
      prisma.community.findUnique({ where: { code }, select: { id: true } }),
    ]);
    if (emailOwner && emailOwner.id !== user.id) return NextResponse.json({ error: "Email sudah digunakan akun lain." }, { status: 409 });
    if (codeOwner && codeOwner.id !== membership.communityId) return NextResponse.json({ error: "Kode komunitas sudah digunakan." }, { status: 409 });

    const passwordHash = parsed.data.password ? await hashPassword(parsed.data.password) : undefined;
    const [community, admin] = await prisma.$transaction([
      prisma.community.update({
        where: { id: membership.communityId },
        data: {
          name: parsed.data.communityName,
          address: parsed.data.address,
          code,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          name: parsed.data.adminName,
          email,
          whatsapp: parsed.data.phone,
          ...(passwordHash ? { passwordHash } : {}),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      community: { id: community.id, name: community.name, address: community.address, code: community.code },
      admin: { id: admin.id, name: admin.name, email: admin.email, phone: admin.whatsapp },
    });
  } catch (error) {
    console.error("Community admin settings update error:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan komunitas." }, { status: 500 });
  }
}