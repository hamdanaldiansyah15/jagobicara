"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  Square,
  RefreshCw,
  Clock,
  Loader2,
  AlertCircle,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "PARTICIPANT" | "COMMUNITY_ADMIN" | "SUPER_ADMIN";
  community?: { name: string; code: string } | null;
}

interface Topic {
  id: string;
  category: string;
  title: string;
  prompt: string;
  tips?: string | null;
}

export default function BicaraPage() {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [loadingTopic, setLoadingTopic] = useState(true);
  const [sessionState, setSessionState] = useState<
    "ready" | "countdown" | "recording" | "analyzing"
  >("ready");
  const [countdown, setCountdown] = useState(3);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [micSupported, setMicSupported] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [sessionUser, setSessionUser] = useState<SessionUser | null | undefined>(undefined);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const transcriptRef = useRef("");
  const finishingRef = useRef(false);

  // Fetch random topic on load
  const fetchTopic = async () => {
    setLoadingTopic(true);
    try {
      const res = await fetch("/api/bicara/random-topic");
      const data = await res.json();
      if (res.ok && data.topic) {
        setTopic(data.topic);
      } else {
        toastError("Gagal mengambil topik.");
      }
    } catch {
      toastError("Gagal memuat topik berbicara.");
    } finally {
      setLoadingTopic(false);
    }
  };

  useEffect(() => {
    fetchTopic();
    fetch("/api/auth/me")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setSessionUser(data?.user ?? null))
      .catch(() => setSessionUser(null));
    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicSupported(false);
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };
    if (!speechWindow.SpeechRecognition && !speechWindow.webkitSpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleStartCountdown = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setSessionState("countdown");
    setCountdown(3);

    let count = 3;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        startRecording();
      }
    }, 1000);
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    setSecondsRemaining(60);
    transcriptRef.current = "";
    finishingRef.current = false;
    setTranscript("");
    setInterimTranscript("");

    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Browser ini tidak mendukung perekaman mikrofon.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.start();

      const speechWindow = window as Window & {
        SpeechRecognition?: new () => any;
        webkitSpeechRecognition?: new () => any;
      };
      const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
      if (Recognition) {
        const recognition = new Recognition();
        recognition.lang = "id-ID";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
          let interim = "";
          let finalText = transcriptRef.current;
          for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const result = event.results[index];
            const recognized = result[0]?.transcript?.trim();
            if (!recognized) continue;
            if (result.isFinal) finalText = `${finalText} ${recognized}`.trim();
            else interim = `${interim} ${recognized}`.trim();
          }
          transcriptRef.current = finalText;
          setTranscript(finalText);
          setInterimTranscript(interim);
        };
        recognition.onerror = (event: any) => {
          if (event.error !== "no-speech" && event.error !== "aborted") {
            toastError("Transkripsi otomatis terhenti. Kamu masih bisa melengkapi teks secara manual.");
          }
        };
        recognitionRef.current = recognition;
        try {
          recognition.start();
        } catch {
          recognitionRef.current = null;
          setSpeechSupported(false);
          toastError("Transkripsi otomatis tidak dapat dimulai. Kamu bisa mengetik ucapan secara manual.");
        }
      }
    } catch (err) {
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
      setSessionState("ready");
      toastError(err instanceof Error ? err.message : "Izin mikrofon diperlukan untuk memulai latihan.");
      return;
    }

    setSessionState("recording");
    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          finishRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishRecording = async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setSessionState("analyzing");

    // Calculate actual elapsed duration
    const elapsedSeconds = Math.max(
      1,
      Math.min(60, Math.round((Date.now() - startTimeRef.current) / 1000))
    );

    // Stop MediaRecorder
    try {
      recognitionRef.current?.stop();
    } catch {
      // Recognition may already have stopped after a browser speech error.
    }
    recognitionRef.current = null;

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setInterimTranscript("");

    try {
      const res = await fetch("/api/bicara/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: topic?.id,
          topicTitle: topic?.title || "Latihan Berbicara",
          durationSeconds: elapsedSeconds,
          audioRecorded: !!mediaRecorderRef.current,
          transcript: transcriptRef.current.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.attemptId) {
        toastSuccess("Latihan selesai dievaluasi!");
        router.push(`/bicara/result/${data.attemptId}`);
      } else {
        toastError(data.error || "Gagal menganalisis rekaman.");
        setSessionState("ready");
        finishingRef.current = false;
      }
    } catch {
      toastError("Terjadi gangguan saat mengirim hasil rekaman.");
      setSessionState("ready");
      finishingRef.current = false;
    }
  };

  return sessionUser === undefined ? (
      <div className="min-h-screen bg-surface-bg" aria-label="Memuat sesi" />
    ) : (
    <AppShell user={sessionUser}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/beranda"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">
            Sesi 60 Detik
          </span>
        </div>

        {/* State 1: Ready to start */}
        {sessionState === "ready" && (
          <div className="space-y-5">
            <Card className="border-slate-200/80 text-center py-8 px-6 sm:px-10">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-2">
                Topik Kamu Hari Ini
              </span>

              {loadingTopic ? (
                <div className="py-8 space-y-3 animate-pulse">
                  <div className="h-6 bg-slate-200 rounded-lg w-3/4 mx-auto" />
                  <div className="h-4 bg-slate-100 rounded-lg w-1/2 mx-auto" />
                </div>
              ) : topic ? (
                <div className="space-y-4">
                  <span className="inline-block text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                    Kategori: {topic.category}
                  </span>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    &ldquo;{topic.title}&rdquo;
                  </h2>

                  <p className="text-sm text-slate-600 max-w-lg mx-auto font-normal leading-relaxed">
                    {topic.prompt}
                  </p>

                  {topic.tips && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 text-left flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-amber-900">Tips Jawaban:</p>
                        <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                          {topic.tips}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Topik tidak dapat dimuat.</p>
              )}

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-3">
                <p className="text-xs text-slate-500 font-medium">
                  Persiapkan jawabanmu. Waktu berbicara: <strong className="text-slate-800">60 detik</strong>.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                  <Button
                    onClick={handleStartCountdown}
                    variant="primary"
                    size="lg"
                    disabled={loadingTopic || !topic}
                    className="w-full sm:w-48 shadow-lg shadow-primary/25"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    <span>Mulai Bicara</span>
                  </Button>

                  <Button
                    onClick={fetchTopic}
                    variant="outline"
                    size="lg"
                    disabled={loadingTopic}
                    className="w-full sm:w-auto"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingTopic ? "animate-spin" : ""}`} />
                    <span>Ganti Topik</span>
                  </Button>
                </div>
              </div>
            </Card>

            {!micSupported && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  Perangkat tidak mendukung perekaman mikrofon. Gunakan browser dengan dukungan mikrofon untuk memulai latihan.
                </span>
              </div>
            )}
          </div>
        )}

        {/* State 2: Countdown 3 - 2 - 1 */}
        {sessionState === "countdown" && (
          <Card className="py-20 text-center flex flex-col items-center justify-center min-h-[360px]">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Bersiaplah...
            </p>
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center text-6xl font-black shadow-xl shadow-primary/30 animate-in zoom-in-75 duration-300">
              {countdown}
            </div>
            <p className="text-sm font-semibold text-slate-700 mt-6 max-w-xs">
              Tarik napas dalam, tatap layar, dan bicaralah dengan percaya diri!
            </p>
          </Card>
        )}

        {/* State 3: Active Recording */}
        {sessionState === "recording" && (
          <Card className="py-12 px-6 text-center flex flex-col items-center justify-center space-y-6">
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span>Sedang berbicara...</span>
            </div>

            {/* Topic Reminder */}
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                &ldquo;{topic?.title}&rdquo;
              </h3>
            </div>

            {/* Central Animated Mic Sphere */}
            <div className="relative my-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-red-500 to-rose-600 text-white flex items-center justify-center shadow-xl animate-recording">
                <Mic className="w-12 h-12 text-white animate-pulse-subtle" />
              </div>
            </div>

            {/* Timer Countdown from 60 */}
            <div>
              <div className="text-5xl font-mono font-black text-slate-900 tracking-tight">
                00:{String(secondsRemaining).padStart(2, "0")}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Sesi akan otomatis selesai pada 00:00
              </p>
            </div>

            <div className="w-full max-w-xl text-left">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="live-transcript" className="text-sm font-bold text-slate-800">Transkrip ucapan</label>
                <span className="text-xs text-slate-500">{transcript.trim() ? transcript.trim().split(/\s+/).length : 0} kata tercatat</span>
              </div>
              <textarea
                id="live-transcript"
                value={transcript}
                onChange={(event) => {
                  transcriptRef.current = event.target.value;
                  setTranscript(event.target.value);
                }}
                rows={5}
                placeholder={speechSupported ? "Ucapanmu akan muncul di sini. Kamu bisa mengoreksi hasil transkripsi sebelum selesai." : "Browser ini tidak menyediakan transkripsi otomatis. Ketik ucapanmu di sini saat berbicara agar bisa dinilai."}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="mt-1 text-left text-[11px] text-slate-500">
                {speechSupported ? "Transkripsi otomatis browser aktif; periksa dan koreksi teks sebelum mengakhiri latihan." : "Transkripsi otomatis tidak tersedia di browser ini; isi teks secara manual agar penilaian berbasis kata dapat dilakukan."}
                {interimTranscript && <span className="ml-1 italic text-slate-400">Mendengar: {interimTranscript}</span>}
              </p>
            </div>

            {/* Stop Button */}
            <div className="pt-2">
              <Button
                onClick={finishRecording}
                variant="danger"
                size="lg"
                className="px-8 shadow-lg shadow-red-500/20"
              >
                <Square className="w-4 h-4 fill-current mr-2" />
                <span>Selesai Bicara</span>
              </Button>
            </div>
          </Card>
        )}

        {/* State 4: Analyzing */}
        {sessionState === "analyzing" && (
          <Card className="py-20 text-center flex flex-col items-center justify-center min-h-[360px] space-y-5">
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary shadow-sm animate-bounce">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Menganalisis Penampilan Bicaramu...
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Sistem sedang mengukur kelancaran, struktur, relevansi topik, dan menyusun feedback konstruktif untukmu.
              </p>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
    );
}
