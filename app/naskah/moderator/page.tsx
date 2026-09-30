"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users2, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScriptViewer } from "@/components/scripts/ScriptViewer";
import { ScriptGenerator, LanguageTone } from "@/lib/script-generator";

export default function ModeratorScriptPage() {
  const [eventName, setEventName] = useState("Diskusi Pemuda dan Inovasi");
  const [topic, setTopic] = useState("Peran pemuda dalam membangun ekosistem kreatif");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [tone, setTone] = useState<LanguageTone>("Profesional");
  const [speakers, setSpeakers] = useState([{ name: "Bapak Rafi", title: "Co-Founder Komunitas Kreatif" }, { name: "Ibu Sinta", title: "Pendamping Program" }]);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  const handleAddSpeaker = () => {
    if (!name.trim() || !title.trim()) return;
    setSpeakers([...speakers, { name: name.trim(), title: title.trim() }]);
    setName("");
    setTitle("");
  };

  const handleRemoveSpeaker = (index: number) => {
    setSpeakers(speakers.filter((_, i) => i !== index));
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratedScript(
      ScriptGenerator.generateModeratorScript({
        eventName,
        topic,
        speakers,
        durationMinutes,
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
          <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">Generator Moderator</span>
        </div>

        {generatedScript ? (
          <ScriptViewer title={`Naskah Moderator: ${eventName}`} initialContent={generatedScript} onReset={() => setGeneratedScript(null)} />
        ) : (
          <Card className="border-slate-200/80 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-2">
              <Users2 className="w-5 h-5 text-primary" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Susun Naskah Moderator</h1>
            </div>
            <p className="text-xs text-slate-500 mb-6">Atur narasumber, durasi, tema, dan flow sesi diskusi agar acara terasa terarah dan profesional.</p>

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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tema Diskusi</label>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} required className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Durasi Sesi (menit)</label>
                <input type="number" min="10" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} required className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Narasumber</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama narasumber" className="rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Jabatan / peran" className="rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleAddSpeaker}><Plus className="w-3.5 h-3.5 mr-1" />Tambah Narasumber</Button>
                <div className="mt-3 space-y-2">
                  {speakers.map((speaker, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="text-sm text-slate-600">{speaker.name} — {speaker.title}</span>
                      <button type="button" onClick={() => handleRemoveSpeaker(idx)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full">Buat Naskah Moderator</Button>
            </form>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
