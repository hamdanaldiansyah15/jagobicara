export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const questionSchema = z.object({
  question: z.string().min(10, "Pertanyaan minimal 10 karakter"),
  optionA: z.string().min(1, "Pilihan A wajib diisi"),
  optionB: z.string().min(1, "Pilihan B wajib diisi"),
  optionC: z.string().min(1, "Pilihan C wajib diisi"),
  optionD: z.string().min(1, "Pilihan D wajib diisi"),
  correctAnswer: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().min(10, "Penjelasan minimal 10 karakter"),
});

const contentSchema = z.object({
  summary: z.string().min(1, "Ringkasan materi wajib diisi"),
  chapters: z.array(z.object({
    title: z.string().min(1, "Judul bagian materi wajib diisi"),
    body: z.string().min(10, "Isi bagian materi minimal 10 karakter"),
    tip: z.string().optional(),
  })).min(1, "Tambahkan minimal satu bagian materi"),
});

const moduleSchema = z.object({
  title: z.string().min(3, "Judul modul wajib diisi"),
  subtitle: z.string().min(3, "Subjudul modul wajib diisi"),
  description: z.string().min(20, "Deskripsi modul wajib diisi"),
  order: z.coerce.number().int().min(1).max(20),
  courseId: z.string().min(1).optional().nullable(),
  pdfTitle: z.string().optional().nullable(),
  pdfUrl: z.string().optional().nullable().refine((value) => {
    if (!value || value.startsWith("/uploads/modules/")) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "URL PDF tidak valid"),
  content: contentSchema,
  questions: z.array(questionSchema).min(1, "Minimal tambahkan 1 soal pilihan ganda").max(50),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = moduleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data modul tidak valid" }, { status: 400 });
    }

    const { title, subtitle, description, order, courseId, pdfTitle, pdfUrl, content, questions } = parsed.data;

    if (courseId) {
      const course = await prisma.learningCourse.findUnique({ where: { id: courseId }, select: { id: true, isActive: true } });
      if (!course || !course.isActive) return NextResponse.json({ error: "Kelas tujuan tidak ditemukan atau nonaktif." }, { status: 400 });
    }

    const existing = await prisma.module.findFirst({ where: { courseId: courseId || null, order } });
    if (existing) {
      return NextResponse.json({ error: `Urutan modul ${order} sudah digunakan.` }, { status: 400 });
    }

    const moduleItem = await prisma.$transaction(async (tx) => {
      const created = await tx.module.create({
        data: {
          title,
          subtitle,
          description,
          order,
          courseId: courseId || null,
          pdfTitle: pdfTitle || null,
          pdfUrl: pdfUrl || null,
          content: JSON.stringify(content),
        },
      });

      await tx.quizQuestion.createMany({
        data: questions.map((q, index) => ({ ...q, moduleId: created.id, order: index + 1 })),
      });

      await tx.badge.create({
        data: {
          name: `${title} Selesai`,
          description: `Menyelesaikan kuis dan materi modul ${title}.`,
          icon: "award",
          moduleId: created.id,
        },
      });

      return tx.module.findUniqueOrThrow({
        where: { id: created.id },
        include: { badge: true, questions: { orderBy: { order: "asc" } } },
      });
    });

    return NextResponse.json({
      success: true,
      module: moduleItem,
    });
  } catch (error) {
    console.error("Create module admin error:", error);
    return NextResponse.json({ error: "Gagal menyimpan modul dan soal." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    const id = z.string().min(1).safeParse(body.id);
    const parsed = moduleSchema.safeParse(body);
    if (!id.success || !parsed.success) {
      return NextResponse.json({
        error: parsed.success ? "ID modul tidak valid" : parsed.error.issues[0]?.message || "Data modul tidak valid",
      }, { status: 400 });
    }

    const current = await prisma.module.findUnique({ where: { id: id.data }, select: { id: true, courseId: true } });
    if (!current) return NextResponse.json({ error: "Modul tidak ditemukan" }, { status: 404 });

    if (parsed.data.courseId) {
      const course = await prisma.learningCourse.findUnique({ where: { id: parsed.data.courseId }, select: { id: true, isActive: true } });
      if (!course || !course.isActive) return NextResponse.json({ error: "Kelas tujuan tidak ditemukan atau nonaktif." }, { status: 400 });
    }

    const duplicateOrder = await prisma.module.findFirst({ where: { courseId: parsed.data.courseId || null, order: parsed.data.order }, select: { id: true } });
    if (duplicateOrder && duplicateOrder.id !== id.data) {
      return NextResponse.json({ error: `Urutan modul ${parsed.data.order} sudah digunakan.` }, { status: 400 });
    }

    const { title, subtitle, description, order, courseId, pdfTitle, pdfUrl, content, questions } = parsed.data;
    const moduleItem = await prisma.$transaction(async (tx) => {
      await tx.module.update({
        where: { id: id.data },
        data: {
          title,
          subtitle,
          description,
          order,
          courseId: courseId || null,
          pdfTitle: pdfTitle || null,
          pdfUrl: pdfUrl || null,
          content: JSON.stringify(content),
        },
      });
      await tx.quizQuestion.deleteMany({ where: { moduleId: id.data } });
      await tx.quizQuestion.createMany({
        data: questions.map((q, index) => ({ ...q, moduleId: id.data, order: index + 1 })),
      });
      const existingBadge = await tx.badge.findUnique({ where: { moduleId: id.data }, select: { id: true } });
      if (!existingBadge) {
        await tx.badge.create({
          data: {
            name: `${title} Selesai`,
            description: `Menyelesaikan kuis dan materi modul ${title}.`,
            icon: "award",
            moduleId: id.data,
          },
        });
      }
      return tx.module.findUniqueOrThrow({
        where: { id: id.data },
        include: { badge: true, questions: { orderBy: { order: "asc" } } },
      });
    });

    return NextResponse.json({ success: true, module: moduleItem });
  } catch (error) {
    console.error("Update module admin error:", error);
    return NextResponse.json({ error: "Gagal memperbarui modul dan soal." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    const id = z.string().min(1).safeParse(body.id);
    if (!id.success) return NextResponse.json({ error: "ID modul tidak valid" }, { status: 400 });

    const moduleItem = await prisma.module.findUnique({ where: { id: id.data }, select: { id: true } });
    if (!moduleItem) return NextResponse.json({ error: "Modul tidak ditemukan" }, { status: 404 });

    const progressCount = await prisma.moduleProgress.count({ where: { moduleId: id.data } });
    if (progressCount > 0) {
      return NextResponse.json({ error: "Modul tidak dapat dihapus karena sudah memiliki progress peserta." }, { status: 409 });
    }

    await prisma.module.delete({ where: { id: id.data } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete module admin error:", error);
    return NextResponse.json({ error: "Gagal menghapus modul." }, { status: 500 });
  }
}
