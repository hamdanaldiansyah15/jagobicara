export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/passwords";
import prisma from "@/lib/db/prisma";

const createCommunitySchema = z.object({
  communityName: z.string().trim().min(3, "Nama komunitas minimal 3 karakter"),
  address: z.string().trim().min(5, "Alamat komunitas wajib diisi"),
  code: z.string().trim().min(4).max(24).regex(/^[A-Za-z0-9-]+$/, "Kode hanya boleh berisi huruf, angka, atau tanda hubung"),
  adminName: z.string().trim().min(2, "Nama admin minimal 2 karakter"),
  email: z.string().trim().email("Format email tidak valid"),
  phone: z.string().trim().min(8, "Nomor telepon minimal 8 digit").max(20),
  password: z.string().min(8, "Password minimal 8 karakter").max(72),
});

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Hanya super admin yang dapat membuat komunitas." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createCommunitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data komunitas tidak valid." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const code = parsed.data.code.toUpperCase();
    const [existingCode, existingEmail] = await Promise.all([
      prisma.community.findUnique({ where: { code }, select: { id: true } }),
      prisma.user.findUnique({ where: { email }, select: { id: true } }),
    ]);
    if (existingCode) return NextResponse.json({ error: "Kode komunitas sudah digunakan." }, { status: 409 });
    if (existingEmail) return NextResponse.json({ error: "Email admin sudah digunakan." }, { status: 409 });

    const passwordHash = await hashPassword(parsed.data.password);
    const result = await prisma.$transaction(async (tx) => {
      const community = await tx.community.create({
        data: {
          name: parsed.data.communityName,
          address: parsed.data.address,
          code,
          status: "ACTIVE",
        },
      });
      const admin = await tx.user.create({
        data: {
          name: parsed.data.adminName,
          age: 18,
          gender: "Tidak disebutkan",
          email,
          whatsapp: parsed.data.phone,
          passwordHash,
          role: "COMMUNITY_ADMIN",
        },
      });
      await tx.communityMember.create({ data: { communityId: community.id, userId: admin.id } });
      return { community, admin };
    });

    return NextResponse.json({
      success: true,
      community: result.community,
      admin: { id: result.admin.id, name: result.admin.name, email: result.admin.email, phone: result.admin.whatsapp },
    }, { status: 201 });
  } catch (error) {
    console.error("Create community admin error:", error);
    return NextResponse.json({ error: "Komunitas atau email admin mungkin sudah digunakan." }, { status: 500 });
  }
}