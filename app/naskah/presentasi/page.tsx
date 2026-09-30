"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Presentation, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScriptViewer } from "@/components/scripts/ScriptViewer";
import { ScriptGenerator, LanguageTone } from "@/lib/script-generator";

export default function PresentationScriptPage() {
  const [title, setTitle] = useState("Menggali Potensi Pemuda dalam Era Digital");
  const [audience, setAudience] = useState("pemuda dan pelaku komunitas");
  const [purpose, setPurpose] = useState("menjelaskan langkah-langkah nyata yang bisa dilakukan untuk memanfaatkan teknologi dengan positif");
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [tone, setTone] = useState<LanguageTone>("Profesional");
  const [mainPoints, setMainPoints] = useState([
    "Kebutuhan adaptasi digital yang sehat",
    "Strategi kolaborasi antar komunitas",
    "Langkah aksi yang bisa dilakukan mulai hari ini",
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
      ScriptGenerator.generatePresentationScript({
        title,
        audience,
        purpose,
        durationMinutes,
        mainPoints,
        tone,
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
          <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">Generator Presentasi</span>
        </div>

        {generatedScript ? (
          <ScriptViewer title={`Naskah Presentasi: ${title}`} initialContent={generatedScript} onReset={() => setGeneratedScript(null)} />
        ) : (
          <Card className="border-slate-200/80 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-2">
              <Presentation className="w-5 h-5 text-primary" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Susun Naskah Presentasi</h1>
            </div>
            <p className="text-xs text-slate-500 mb-6">Buat outline presentasi inspiratif yang punya hook, isi berdampak, dan call to action yang kuat.</p>

            <form onSubmit={handleGenerate} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Judul Presentasi</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Audiens</label>
                  <input value={audience} onChange={(e) => setAudience(e.target.value)} required className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Durasi (menit)</label>
                  <input type="number" min="5" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} required className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tujuan Presentasi</label>
                <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={3} required className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Poin Isi Presentasi</label>
                <div className="flex gap-2 mb-2">
                  <input value={newPoint} onChange={(e) => setNewPoint(e.target.value)} placeholder="Tambahkan poin utama" className="flex-1 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
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

              <Button type="submit" variant="primary" size="lg" className="w-full">Buat Naskah Presentasi</Button>
            </form>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
