import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const count = await prisma.speakingTopic.count({
      where: { isActive: true },
    });

    if (count === 0) {
      return NextResponse.json(
        { error: "Belum ada topik berbicara yang tersedia." },
        { status: 404 }
      );
    }

    const skip = Math.floor(Math.random() * count);
    const topic = await prisma.speakingTopic.findFirst({
      where: { isActive: true },
      skip,
    });

    return NextResponse.json({ topic });
  } catch (error) {
    console.error("Error fetching random topic:", error);
    return NextResponse.json(
      { error: "Gagal mengambil topik." },
      { status: 500 }
    );
  }
}
