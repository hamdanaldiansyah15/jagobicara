export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { issueCertificateIfEligible } from "@/lib/certificate/generator";
import { issueCourseCertificateIfEligible } from "@/lib/courses/access";
import { isModuleUnlocked } from "@/lib/modules/access";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const moduleId = params.id;
    const moduleItem = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { id: true, courseId: true },
    });
    if (!moduleItem) {
      return NextResponse.json({ error: "Modul tidak ditemukan." }, { status: 404 });
    }
    if (!(await isModuleUnlocked(user.id, moduleItem.id))) {
      return NextResponse.json({ error: "Kelas ini terkunci atau modul sebelumnya belum selesai." }, { status: 403 });
    }

    const body = await req.json();
    const { answers } = body as { answers: Record<string, string> };

    if (!answers) {
      return NextResponse.json(
        { error: "Jawaban kuis tidak valid." },
        { status: 400 }
      );
    }

    // Fetch all active questions for this module
    const questions = await prisma.quizQuestion.findMany({
      where: { moduleId },
      orderBy: { order: "asc" },
    });

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "Kuis belum tersedia untuk modul ini." },
        { status: 404 }
      );
    }

    let correctCount = 0;
    const breakdown = questions.map((q) => {
      const userAnswer = answers[q.id]?.toUpperCase();
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount += 1;

      return {
        questionId: q.id,
        order: q.order,
        question: q.question,
        userAnswer: userAnswer || null,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const normalizedScore = Math.round((correctCount / questions.length) * 10);
    const isPassed = correctCount === questions.length;
    let awardedBadge = null;
    let issuedCertificate = null;

    // Update or create ModuleProgress
    const existingProgress = await prisma.moduleProgress.findUnique({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId,
        },
      },
    });

    const attemptsCount = (existingProgress?.attemptsCount || 0) + 1;

    if (isPassed) {
      await prisma.moduleProgress.upsert({
        where: {
          userId_moduleId: {
            userId: user.id,
            moduleId,
          },
        },
        update: {
          isCompleted: true,
          quizScore: 10,
          attemptsCount,
          completedAt: new Date(),
        },
        create: {
          userId: user.id,
          moduleId,
          isCompleted: true,
          quizScore: 10,
          attemptsCount,
          completedAt: new Date(),
        },
      });

      // Award badge if not already awarded
      const badge = await prisma.badge.findUnique({
        where: { moduleId },
      });

      if (badge) {
        const userBadge = await prisma.userBadge.upsert({
          where: {
            userId_badgeId: {
              userId: user.id,
              badgeId: badge.id,
            },
          },
          update: {},
          create: {
            userId: user.id,
            badgeId: badge.id,
            awardedAt: new Date(),
          },
        });
        awardedBadge = badge;
      }

      // Check if all 5 modules completed to automatically issue certificate
      issuedCertificate = moduleItem.courseId
        ? await issueCourseCertificateIfEligible(user.id, moduleItem.courseId)
        : await issueCertificateIfEligible(user.id);
    } else {
      // Record failed attempt without marking completed
      await prisma.moduleProgress.upsert({
        where: {
          userId_moduleId: {
            userId: user.id,
            moduleId,
          },
        },
        update: {
          attemptsCount,
          quizScore: Math.max(existingProgress?.quizScore || 0, normalizedScore),
        },
        create: {
          userId: user.id,
          moduleId,
          isCompleted: false,
          quizScore: normalizedScore,
          attemptsCount,
        },
      });
    }

    return NextResponse.json({
      success: true,
      score: correctCount,
      totalQuestions: questions.length,
      isPassed,
      breakdown,
      awardedBadge,
      issuedCertificate,
    });
  } catch (error) {
    console.error("Quiz submit error:", error);
    return NextResponse.json(
      { error: "Gagal memproses penilaian kuis." },
      { status: 500 }
    );
  }
}
