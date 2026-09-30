export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  age: z.coerce.number().min(12, "Umur minimal 12 tahun").max(99, "Umur maksimal 99 tahun"),
  gender: z.enum(["Laki-laki", "Perempuan", "Tidak disebutkan"], { errorMap: () => ({ message: "Gender tidak valid" }) }),
  email: z.string().email("Format email tidak valid"),
  whatsapp: z.string().min(8, "Nomor WhatsApp minimal 8 digit"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
    }

    const formData = await req.formData();
    const payload = {
      name: String(formData.get("name") ?? ""),
      age: formData.get("age") ?? user.age,
      gender: String(formData.get("gender") ?? user.gender),
      email: String(formData.get("email") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? ""),
    };

    const parsed = profileSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data profil tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "Email sudah digunakan oleh akun lain." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        age: parsed.data.age,
        gender: parsed.data.gender,
        email: parsed.data.email.toLowerCase(),
        whatsapp: parsed.data.whatsapp,
      },
    });

    return NextResponse.redirect(new URL("/akun", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat memperbarui profil." }, { status: 500 });
  }
}
