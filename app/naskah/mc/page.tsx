"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, FileText, Mic } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScriptViewer } from "@/components/scripts/ScriptViewer";
import { ScriptGenerator, EventStyle, LanguageTone } from "@/lib/script-generator";

export default function McScriptPage() {
  const [eventType, setEventType] = useState<EventStyle>("Semi-formal");
  const [eventName, setEventName] = useState("Festival Pemuda Kreatif Simbang");
  const [eventDate, setEventDate] = useState("Sabtu, 24 Oktober 2026");
  const [eventLocation, setEventLocation] = useState("Aula Balai Warga Simbang");
  const [tone, setTone] = useState<LanguageTone>("Hangat");

  const [honoredGuests, setHonoredGuests] = useState<string[]>([
    "Kepala Desa Simbang",
    "Ketua Karang Taruna Simbang",
  ]);
  const [newGuest, setNewGuest] = useState("");

  const [agendaItems, setAgendaItems] = useState<string[]>([
    "Pembukaan",
    "Menyanyikan Lagu Indonesia Raya",
    "Sambutan Ketua Panitia",
    "Sambutan Kepala Desa",
    "Sesi Acara Inti (Workshop & Diskusi)",
    "Sesi Tanya Jawab",
    "Pembacaan Doa",
    "Penutup",
  ]);
  const [newAgenda, setNewAgenda] = useState("");

  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  const handleAddGuest = () => {
    if (newGuest.trim()) {
      setHonoredGuests([...honoredGuests, newGuest.trim()]);
      setNewGuest("");
    }
  };

  const handleRemoveGuest = (index: number) => {
    setHonoredGuests(honoredGuests.filter((_, i) => i !== index));
  };

  const handleAddAgenda = () => {
    if (newAgenda.trim()) {
      setAgendaItems([...agendaItems, newAgenda.trim()]);
      setNewAgenda("");
    }
  };

  const handleRemoveAgenda = (index: number) => {
    setAgendaItems(agendaItems.filter((_, i) => i !== index));
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const script = ScriptGenerator.generateMcScript({
      eventType,
      eventName,
      eventDate,
      eventLocation,
      honoredGuests,
      agendaItems,
      tone,
    });
    setGeneratedScript(script);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/naskah"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Pilihan Naskah</span>
          </Link>
          <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">
            Generator MC
          </span>
        </div>

        {generatedScript ? (
          <ScriptViewer
            title={`Naskah MC: ${eventName}`}
            initialContent={generatedScript}
            onReset={() => setGeneratedScript(null)}
          />
        ) : (
          <Card className="border-slate-200/80 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-5 h-5 text-primary" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Susun Naskah Master of Ceremony (MC)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Lengkapi data acara dan susunan kegiatan di bawah ini untuk menghasilkan panduan MC otomatis.
            </p>

            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Event Type & Tone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jenis Acara
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventStyle)}
                    className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="Formal">Formal (Resmi Protokoler)</option>
                    <option value="Semi-formal">Semi-formal (Workshop / Seminar)</option>
                    <option value="Non-formal">Non-formal (Santai / Komunitas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Gaya Bahasa
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as LanguageTone)}
                    className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="Hangat">Hangat & Interaktif</option>
                    <option value="Formal">Formal & Khidmat</option>
                    <option value="Santai">Santai & Ceria</option>
                    <option value="Profesional">Profesional & Terstruktur</option>
                  </select>
                </div>
              </div>

              {/* Event Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Acara
                </label>
                <input
                  type="text"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Contoh: Diskusi Pemuda Inspiratif"
                  className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tanggal Acara
                  </label>
                  <input
                    type="text"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="Contoh: Sabtu, 24 Oktober 2026"
                    className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tempat / Platform
                  </label>
                  <input
                    type="text"
                    required
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Contoh: Aula Balai Desa / Zoom Meeting"
                    className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Honored Guests */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tamu Kehormatan / Undangan Utama
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newGuest}
                    onChange={(e) => setNewGuest(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddGuest();
                      }
                    }}
                    placeholder="Ketik nama/jabatan tamu lalu tekan Tambah"
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <Button
                    type="button"
                    onClick={handleAddGuest}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Tambah</span>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {honoredGuests.map((guest, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-lg border border-slate-200"
                    >
                      <span>{guest}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGuest(idx)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Agenda Items */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Susunan Acara (Runtut dari Awal ke Akhir)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newAgenda}
                    onChange={(e) => setNewAgenda(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAgenda();
                      }
                    }}
                    placeholder="Ketik agenda baru lalu klik Tambah"
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <Button
                    type="button"
                    onClick={handleAddAgenda}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Tambah</span>
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {agendaItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <span className="font-medium text-slate-800">
                        {idx + 1}. {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAgenda(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full shadow-lg shadow-primary/20"
                >
                  <FileText className="w-4 h-4 mr-2 text-white" />
                  <span>Buat Naskah MC Sekarang</span>
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
