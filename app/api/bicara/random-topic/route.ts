export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

const noStoreHeaders = { "Cache-Control": "no-store, no-cache, must-revalidate" };

export async function GET() {
  try {
    const count = await prisma.speakingTopic.count({
      where: { isActive: true },
    });

    if (count === 0) {
      return NextResponse.json(
        { error: "Belum ada topik berbicara yang tersedia." },
        { status: 404, headers: noStoreHeaders }
      );
    }

    const skip = Math.floor(Math.random() * count);
    const topic = await prisma.speakingTopic.findFirst({
      where: { isActive: true },
      skip,
    });

    return NextResponse.json({ topic }, { headers: noStoreHeaders });
  } catch (error) {
    console.error("Error fetching random topic:", error);
    return NextResponse.json(
      { error: "Gagal mengambil topik." },
      { status: 500, headers: noStoreHeaders }
    );
  }
}
