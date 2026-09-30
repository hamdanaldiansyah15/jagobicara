export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { speakingAnalyzer } from "@/lib/scoring/speaking-analyzer";
import { getCurrentSeasonKey } from "@/lib/leaderboard/calculator";
import { z } from "zod";

const submissionSchema = z.object({
  topicId: z.string().optional().nullable(),
  topicTitle: z.string().trim().min(1).max(200),
  durationSeconds: z.number().finite().min(0).max(60),
  audioRecorded: z.boolean(),
  transcript: z.string().trim().max(12000),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = submissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data rekaman tidak lengkap." }, { status: 400 });
    }
    const { topicId, topicTitle, durationSeconds, audioRecorded, transcript } = parsed.data;
    const topic = topicId
      ? await prisma.speakingTopic.findUnique({ where: { id: topicId }, select: { prompt: true } })
      : null;

    // Run deterministic speaking evaluation engine
    const analysis = await speakingAnalyzer.analyze({
      topicTitle,
      topicPrompt: topic?.prompt,
      durationSeconds,
      audioRecorded,
      transcribedText: transcript,
    });

    const seasonKey = getCurrentSeasonKey();

    // Save attempt to PostgreSQL
    const attempt = await prisma.speakingAttempt.create({
      data: {
        userId: user.id,
        topicId: topicId || null,
        topicTitle,
        duration: Math.round(durationSeconds),
        fluency: analysis.scores.fluency,
        ideaDev: analysis.scores.ideaDev,
        relevance: analysis.scores.relevance,
        structure: analysis.scores.structure,
        vocabulary: analysis.scores.vocabulary,
        finalScore: analysis.finalScore,
        feedback: analysis.feedback,
        transcript: analysis.transcript,
        correctedTranscript: analysis.correctedTranscript,
        wordCount: analysis.wordCount,
        wordsPerMinute: analysis.wordsPerMinute,
        fillerCount: analysis.fillerCount,
        repetitionCount: analysis.repetitionCount,
        durationScore: analysis.durationScore,
        dimensionNotes: JSON.stringify(analysis.dimensionNotes),
        removedWords: JSON.stringify(analysis.removedWords),
        suggestedAdditions: JSON.stringify(analysis.suggestedAdditions),
        seasonKey,
        valid: analysis.isValid,
      },
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      analysis,
    });
  } catch (error) {
    console.error("Speaking submit error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan hasil rekaman latihan." },
      { status: 500 }
    );
  }
}
