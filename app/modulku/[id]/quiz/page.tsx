"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  HelpCircle,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import confetti from "canvas-confetti";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface Question {
  id: string;
  order: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface BreakdownItem {
  questionId: string;
  order: number;
  question: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export default function ModuleQuizPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleOrder, setModuleOrder] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Result state
  const [result, setResult] = useState<{
    score: number;
    totalQuestions: number;
    isPassed: boolean;
    breakdown: BreakdownItem[];
    awardedBadge?: any;
    issuedCertificate?: any;
  } | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/modules/${params.id}`);
        const data = await res.json();
        if (res.ok && data.module) {
          setModuleTitle(data.module.title);
          setModuleOrder(data.module.order);
          setQuestions(data.module.questions || []);
        } else {
          toastError("Gagal memuat kuis.");
        }
      } catch {
        toastError("Terjadi gangguan saat mengambil data kuis.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [params.id]);

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const handleSubmitQuiz = async () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < questions.length) {
      toastError(`Harap jawab seluruh ${questions.length} pertanyaan sebelum mengumpulkan.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/modules/${params.id}/submit-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: selectedAnswers }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
        if (data.isPassed) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
          toastSuccess("Selamat! Kamu lulus dengan nilai sempurna 10/10!");
        } else {
          toastError(`Skor kamu ${data.score}/${data.totalQuestions}. Belum lulus, coba lagi!`);
        }
      } else {
        toastError(data.error || "Gagal mengirim kuis.");
      }
    } catch {
      toastError("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Memuat pertanyaan kuis...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            href={`/modulku/${params.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Materi</span>
          </Link>

          <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">
            Kuis {questions.length} Soal
          </span>
        </div>

        {/* If Quiz Not Submitted Yet: Show Form */}
        {!result ? (
          <div className="space-y-6">
            <Card className="border-slate-200/80 p-6">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Kuis Modul {moduleOrder}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {moduleTitle}
              </h1>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Jawab seluruh {questions.length} soal dengan tepat. Kamu perlu mendapatkan nilai sempurna untuk lulus.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Dijawab: {Object.keys(selectedAnswers).length} dari {questions.length}</span>
                <span className="text-primary font-bold">
                  {Math.round((Object.keys(selectedAnswers).length / questions.length) * 100)}%
                </span>
              </div>
            </Card>

            {/* Questions List */}
            <div className="space-y-5">
              {questions.map((q, idx) => (
                <Card key={q.id} className="border-slate-200/80 p-5 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h3>
                  </div>

                  {/* 4 Options */}
                  <div className="space-y-2 pt-1">
                    {(["A", "B", "C", "D"] as const).map((key) => {
                      const optionText =
                        key === "A"
                          ? q.optionA
                          : key === "B"
                          ? q.optionB
                          : key === "C"
                          ? q.optionC
                          : q.optionD;

                      const isSelected = selectedAnswers[q.id] === key;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectOption(q.id, key)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center gap-3 ${
                            isSelected
                              ? "bg-indigo-50 border-primary text-slate-900 font-semibold shadow-sm"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSelected
                                ? "bg-primary border-primary text-white"
                                : "border-slate-300 text-slate-500"
                            }`}
                          >
                            {key}
                          </span>
                          <span className="flex-1 leading-snug">{optionText}</span>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>

            {/* Submit CTA */}
            <div className="pt-4 pb-8">
              <Button
                onClick={handleSubmitQuiz}
                variant="primary"
                size="lg"
                className="w-full shadow-lg shadow-primary/20"
                isLoading={submitting}
              >
                <span>Kumpulkan Jawaban Kuis</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="space-y-6 animate-in fade-in duration-300">
            {result.isPassed ? (
              /* PASSED 10/10 */
              <Card className="text-center py-10 px-6 bg-gradient-to-b from-emerald-50 to-white border-emerald-200 shadow-card space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                    Selamat, Kamu Lulus!
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 mt-1">
                    Modul Selesai! (10 / 10)
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Pemahamanmu terhadap materi kelas ini sangat sempurna. Kamu berhak mendapatkan badge pencapaian!
                  </p>
                </div>

                {/* Badge Award Announcement */}
                {result.awardedBadge && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 max-w-sm mx-auto flex items-center gap-3 text-left">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                        Badge Baru Diperoleh!
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {result.awardedBadge.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {result.awardedBadge.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Certificate Unlocked Announcement */}
                {result.issuedCertificate && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white max-w-sm mx-auto text-left shadow-md">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200">
                      Prestasi Tertinggi
                    </span>
                    <h4 className="text-sm font-extrabold mt-0.5">
                      Certificate of Completion Terbit!
                    </h4>
                    <p className="text-[11px] text-amber-100 mt-0.5">
                      Nomor: {result.issuedCertificate.certificateNumber}
                    </p>
                    <Link
                      href="/akun/sertifikat"
                      className="inline-block mt-2.5 text-xs font-bold bg-white text-amber-900 px-3 py-1.5 rounded-lg hover:bg-amber-50"
                    >
                      Buka Sertifikat Saya
                    </Link>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/modulku" className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto">
                      <span>Lanjut ke Modulku</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                  <Link href="/beranda" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Kembali ke Beranda
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              /* FAILED (< 10) */
              <Card className="text-center py-8 px-6 bg-gradient-to-b from-rose-50 to-white border-rose-200 shadow-card space-y-4">
                <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
                    Belum Lulus
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">
                    Skor: {result.score} / {result.totalQuestions}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Untuk menyelesaikan modul dan membuka modul berikutnya, kamu harus menjawab semua soal dengan benar.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    onClick={handleRetry}
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    <span>Coba Lagi Kuis</span>
                  </Button>
                  <Link href={`/modulku/${params.id}`} className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>Pelajari Ulang Materi</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            )}

            {/* Question Breakdown with Explanations */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">
                Pembahasan Soal & Kunci Jawaban
              </h3>

              {result.breakdown.map((item, idx) => (
                <Card
                  key={item.questionId}
                  className={`p-4 space-y-2 border ${
                    item.isCorrect
                      ? "border-emerald-200 bg-emerald-50/20"
                      : "border-rose-200 bg-rose-50/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-xs text-slate-500 mt-0.5">
                        #{idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        {item.question}
                      </p>
                    </div>
                    {item.isCorrect ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        Benar ✓
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full shrink-0">
                        Salah ✗
                      </span>
                    )}
                  </div>

                  <div className="text-xs space-y-1 pt-1">
                    <p className="text-slate-600">
                      Jawabanmu:{" "}
                      <strong className={item.isCorrect ? "text-emerald-700" : "text-rose-600"}>
                        {item.userAnswer || "-"}
                      </strong>{" "}
                      {!item.isCorrect && (
                        <span>
                          | Kunci Jawaban Benar: <strong className="text-emerald-700">{item.correctAnswer}</strong>
                        </span>
                      )}
                    </p>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-[11px] text-slate-600">
                      <strong className="text-slate-800">Penjelasan: </strong>
                      {item.explanation}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
