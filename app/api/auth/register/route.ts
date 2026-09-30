export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/passwords";
import { signToken, COOKIE_NAME } from "@/lib/auth/session";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    age: z.coerce.number().min(12, "Usia minimal 12 tahun").max(99, "Usia tidak valid"),
    gender: z.string().min(1, "Pilih jenis kelamin"),
    email: z.string().email("Format email tidak valid"),
    whatsapp: z.string().min(9, "Nomor WhatsApp minimal 9 digit"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
    communityCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Data pendaftaran tidak valid";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, age, gender, email, whatsapp, password, communityCode } = parsed.data;

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan gunakan email lain atau masuk." },
        { status: 409 }
      );
    }

    // Check community code if provided
    let communityToJoin = null;
    if (communityCode && communityCode.trim().length > 0) {
      const codeUpper = communityCode.trim().toUpperCase();
      communityToJoin = await prisma.community.findUnique({
        where: { code: codeUpper },
      });

      if (!communityToJoin) {
        return NextResponse.json(
          { error: `Kode komunitas '${codeUpper}' tidak ditemukan. Periksa kembali atau kosongkan jika belum punya.` },
          { status: 400 }
        );
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and optional community member
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        age,
        gender,
        email: email.toLowerCase().trim(),
        whatsapp: whatsapp.trim(),
        passwordHash,
        role: "PARTICIPANT",
        ...(communityToJoin
          ? {
              communityMembers: {
                create: {
                  communityId: communityToJoin.id,
                },
              },
            }
          : {}),
      },
      include: {
        communityMembers: {
          include: { community: true },
        },
      },
    });

    // Sign session token
    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        community: newUser.communityMembers[0]?.community || null,
      },
    });

    // Set HTTP-only session cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat pendaftaran." },
      { status: 500 }
    );
  }
}
