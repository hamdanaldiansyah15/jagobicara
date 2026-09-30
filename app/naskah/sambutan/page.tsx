"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquareText, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScriptViewer } from "@/components/scripts/ScriptViewer";
import { ScriptGenerator, LanguageTone } from "@/lib/script-generator";

export default function SambutanScriptPage() {
  const [eventName, setEventName] = useState("Pelantikan Komunitas Pemuda Hebat");
  const [speakerRole, setSpeakerRole] = useState("Ketua Panitia");
  const [purpose, setPurpose] = useState("membuka acara dan mengapresiasi komitmen seluruh peserta");
  const [audience, setAudience] = useState("rekan-rekan pemuda, panitia, dan warga masyarakat");
  const [tone, setTone] = useState<LanguageTone>("Hangat");
  const [mainPoints, setMainPoints] = useState<string[]>([
    "Pentingnya semangat kebersamaan dan kolaborasi",
    "Apresiasi terhadap kerja keras panitia dan peserta",
    "Harapan untuk program yang lebih bermanfaat di masa depan",
  ]);
  const [newPoint, setNewPoint] = useState("");
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  const handleAddPoint = () => {
    if (!newPoint.trim()) return;
    setMainPoints([...mainPoints, newPoint.trim()]);
    setNewPoint("");
  };

  const handleRemovePoint = (index: number) => {
    setMainPoints(mainPoints.filter((_, i) => i !== index));
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratedScript(
      ScriptGenerator.generateSambutanScript({
        eventName,
        speakerRole,
        purpose,
        audience,
        tone,
        mainPoints,
      })
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/naskah" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">Generator Sambutan</span>
        </div>

        {generatedScript ? (
          <ScriptViewer title={`Naskah Sambutan: ${eventName}`} initialContent={generatedScript} onReset={() => setGeneratedScript(null)} />
        ) : (
          <Card className="border-slate-200/80 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquareText className="w-5 h-5 text-primary" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Susun Naskah Sambutan</h1>
            </div>
            <p className="text-xs text-slate-500 mb-6">Buat sambutan formal, hangat, atau inspiratif sesuai peran dan konteks acara.</p>

            <form onSubmit={handleGenerate} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nama Acara</label>
                  <input value={eventName} onChange={(e) => setEventName(e.target.value)} required className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Gaya Bahasa</label>
                  <select value={tone} onChange={(e) => setTone(e.target.value as LanguageTone)} className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="Formal">Formal</option>
                    <option value="Hangat">Hangat</option>
                    <option value="Santai">Santai</option>
                    <option value="Profesional">Profesional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Peran Pembicara</label>
                  <input value={speakerRole} onChange={(e) => setSpeakerRole(e.target.value)} required className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Audiens</label>
                  <input value={audience} onChange={(e) => setAudience(e.target.value)} required className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tujuan Sambutan</label>
                <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={3} required className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Poin Utama Sambutan</label>
                <div className="flex gap-2 mb-2">
                  <input value={newPoint} onChange={(e) => setNewPoint(e.target.value)} placeholder="Tambahkan poin penting" className="flex-1 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddPoint}><Plus className="w-3.5 h-3.5 mr-1" />Tambah</Button>
                </div>
                <div className="space-y-2">
                  {mainPoints.map((point, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="text-sm text-slate-600">{point}</span>
                      <button type="button" onClick={() => handleRemovePoint(idx)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full">Buat Naskah Sambutan</Button>
            </form>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
