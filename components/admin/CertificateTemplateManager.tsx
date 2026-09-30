"use client";

import { useState } from "react";
import { Check, Palette, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CertificateArtwork } from "@/components/certificate/CertificateArtwork";
import { useToast } from "@/components/ui/Toast";

export interface CertificateTemplateDraft {
  scopeKey: string;
  label: string;
  courseCode: string;
  gradientStart: string;
  gradientEnd: string;
  recipientMessage: string;
  signatureName: string;
  signatureRole: string;
}

type EditableField = Exclude<keyof CertificateTemplateDraft, "scopeKey" | "label">;

export function CertificateTemplateManager({
  initialTemplates,
}: {
  initialTemplates: CertificateTemplateDraft[];
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedScope, setSelectedScope] = useState(initialTemplates[0]?.scopeKey || "");
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();
  const selected = templates.find((template) => template.scopeKey === selectedScope);

  const update = (field: EditableField, value: string) => {
    setTemplates((current) => current.map((template) => template.scopeKey === selectedScope
      ? { ...template, [field]: value }
      : template));
  };

  const saveTemplate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/certificates/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selected),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan template sertifikat.");
      setTemplates((current) => current.map((template) => template.scopeKey === selectedScope
        ? { ...template, ...data.template }
        : template));
      success("Template sertifikat berhasil disimpan.");
    } catch (cause) {
      error(cause instanceof Error ? cause.message : "Gagal menyimpan template sertifikat.");
    } finally {
      setSaving(false);
    }
  };

  if (!selected) return null;

  return (
    <Card className="space-y-5 border-slate-200/80 p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-800">
          <Palette className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Template Sertifikat</h2>
          <p className="text-xs text-slate-500">Pengaturan berlaku untuk sertifikat yang diterbitkan berikutnya.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <button
            key={template.scopeKey}
            type="button"
            onClick={() => setSelectedScope(template.scopeKey)}
            aria-pressed={selectedScope === template.scopeKey}
            className={`flex min-h-12 items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-semibold ${selectedScope === template.scopeKey ? "border-orange-400 bg-orange-50 text-orange-950" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            <span className="min-w-0 truncate">{template.label}</span>
            {selectedScope === template.scopeKey && <Check className="h-4 w-4 shrink-0" />}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.85fr)]">
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-slate-700">
            Kode kelas pada nomor sertifikat
            <input
              value={selected.courseCode}
              onChange={(event) => update("courseCode", event.target.value.toUpperCase())}
              required
              minLength={2}
              maxLength={10}
              pattern="[A-Z0-9]+"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm uppercase"
              aria-describedby="certificate-number-example"
            />
            <span id="certificate-number-example" className="mt-1 block font-normal text-slate-500">
              Contoh: JB-{selected.courseCode || "PSII"}-DDMMYY-0001
            </span>
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {([
              ["gradientStart", "Warna awal"],
              ["gradientEnd", "Warna akhir"],
            ] as const).map(([field, label]) => (
              <label key={field} className="block text-xs font-semibold text-slate-700">
                {label}
                <div className="mt-1 flex gap-2">
                  <input
                    type="color"
                    value={/^#[0-9A-F]{6}$/i.test(selected[field]) ? selected[field] : "#F97316"}
                    onChange={(event) => update(field, event.target.value.toUpperCase())}
                    className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                    aria-label={label}
                  />
                  <input
                    value={selected[field]}
                    onChange={(event) => update(field, event.target.value.toUpperCase())}
                    required
                    pattern="#[0-9A-Fa-f]{6}"
                    maxLength={7}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm uppercase"
                  />
                </div>
              </label>
            ))}
          </div>

          <label className="block text-xs font-semibold text-slate-700">
            Kalimat di bawah nama peserta
            <textarea
              value={selected.recipientMessage}
              onChange={(event) => update("recipientMessage", event.target.value)}
              required
              minLength={10}
              maxLength={500}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-700">
              Nama founder
              <input value={selected.signatureName} onChange={(event) => update("signatureName", event.target.value)} required maxLength={100} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal" />
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Jabatan founder
              <input value={selected.signatureRole} onChange={(event) => update("signatureRole", event.target.value)} required maxLength={100} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal" />
            </label>
          </div>

          <Button type="button" variant="primary" size="md" isLoading={saving} onClick={saveTemplate}>
            <Save className="mr-2 h-4 w-4" /> Simpan Template
          </Button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <p className="mb-2 text-xs font-bold uppercase text-slate-500">Pratinjau</p>
          <CertificateArtwork
            userName="Nama Peserta"
            certificateNumber={`JB-${selected.courseCode}-DDMMYY-0001`}
            issueDate={new Date()}
            recipientMessage={selected.recipientMessage}
            gradientStart={selected.gradientStart}
            gradientEnd={selected.gradientEnd}
            signatureName={selected.signatureName}
            signatureRole={selected.signatureRole}
            courseTitle={selected.label}
          />
        </div>
      </div>
    </Card>
  );
}