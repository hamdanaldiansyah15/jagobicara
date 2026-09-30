export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";

const maxFileSize = 20 * 1024 * 1024;
const uploadDirectory = path.join(process.cwd(), "public", "uploads", "modules");

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Pilih file PDF untuk diunggah." }, { status: 400 });
    }
    if (file.size === 0 || file.size > maxFileSize) {
      return NextResponse.json({ error: "Ukuran file harus di bawah 20 MB." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (file.type !== "application/pdf" || bytes.subarray(0, 5).toString("ascii") !== "%PDF-") {
      return NextResponse.json({ error: "File yang dipilih bukan PDF yang valid." }, { status: 400 });
    }

    await mkdir(uploadDirectory, { recursive: true });
    const filename = `${randomUUID()}.pdf`;
    await writeFile(path.join(uploadDirectory, filename), bytes, { flag: "wx" });

    return NextResponse.json({
      success: true,
      url: `/uploads/modules/${filename}`,
      title: file.name.replace(/\.pdf$/i, ""),
    });
  } catch (error) {
    console.error("Module PDF upload error:", error);
    return NextResponse.json({ error: "Gagal mengunggah file PDF." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = z.object({ url: z.string().startsWith("/uploads/modules/") }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Lokasi file tidak valid." }, { status: 400 });
    }

    const filename = parsed.data.url.slice("/uploads/modules/".length);
    if (!/^[0-9a-f-]+\.pdf$/i.test(filename)) {
      return NextResponse.json({ error: "Lokasi file tidak valid." }, { status: 400 });
    }

    try {
      await unlink(path.join(uploadDirectory, filename));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Module PDF delete error:", error);
    return NextResponse.json({ error: "Gagal menghapus file PDF." }, { status: 500 });
  }
}