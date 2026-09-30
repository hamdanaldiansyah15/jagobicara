export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { isModuleUnlocked } from "@/lib/modules/access";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const moduleItem = await prisma.module.findUnique({
      where: { id: params.id },
      include: {
        badge: true,
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!moduleItem) {
      return NextResponse.json(
        { error: "Modul tidak ditemukan." },
        { status: 404 }
      );
    }

    if (!(await isModuleUnlocked(user.id, moduleItem.id))) {
      return NextResponse.json({ error: "Kelas ini terkunci atau modul sebelumnya belum selesai." }, { status: 403 });
    }

    return NextResponse.json({ module: moduleItem });
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json(
      { error: "Gagal memuat modul." },
      { status: 500 }
    );
  }
}
