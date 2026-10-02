"use client";

import { ChangeEvent, useState } from "react";
import { BookOpenText, FileText, Pencil, Plus, PlusCircle, Trash2, Upload, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { CourseOption } from "@/components/admin/CourseManager";

interface ModuleItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  content: string;
  order: number;
  courseId?: string | null;
  pdfTitle?: string | null;
  pdfUrl?: string | null;
  questions: Question[];
}

interface Question {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
}

interface Chapter {
  title: string;
  body: string;
  tip: string;
}

interface ModuleForm {
  title: string;
  subtitle: string;
  description: string;
  order: string;
  courseId: string;
  summary: string;
  chapters: Chapter[];
  pdfTitle: string;
  pdfUrl: string;
  questions: Question[];
}

const emptyQuestion = (): Question => ({
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
  explanation: "",
});

const emptyChapter = (): Chapter => ({ title: "", body: "", tip: "" });

async function deleteUploadedPdf(url: string) {
  if (!url.startsWith("/uploads/modules/")) return;
  await fetch("/api/admin/modules/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

interface ModuleManagerProps {
  initialModules: ModuleItem[];
  courses: CourseOption[];
}

export function ModuleManager({ initialModules, courses }: ModuleManagerProps) {
  const { success, error } = useToast();
  const [modules, setModules] = useState<ModuleItem[]>(initialModules);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const createEmptyForm = (order = "1"): ModuleForm => ({
    title: "",
    subtitle: "",
    description: "",
    order,
    courseId: "",
    summary: "",
    chapters: [emptyChapter()],
    pdfTitle: "",
    pdfUrl: "",
    questions: [emptyQuestion()],
  });
  const [form, setForm] = useState(createEmptyForm());
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof Pick<ModuleForm, "title" | "subtitle" | "description" | "order" | "summary" | "pdfTitle" | "courseId">, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChapterChange = (index: number, field: keyof Chapter, value: string) => {
    setForm((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter, chapterIndex) => chapterIndex === index ? { ...chapter, [field]: value } : chapter),
    }));
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, questionIndex) => questionIndex === index ? { ...question, [field]: value } : question),
    }));
  };

  const handlePdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      error("Pilih file PDF.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      error("Ukuran PDF maksimal 20 MB.");
      return;
    }

    setUploading(true);
    const previousUrl = form.pdfUrl;
    const originalUrl = modules.find((module) => module.id === editingId)?.pdfUrl;
    try {
      const payload = new FormData();
      payload.set("file", file);
      const response = await fetch("/api/admin/modules/upload", { method: "POST", body: payload });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal mengunggah PDF");
      setForm((prev) => ({ ...prev, pdfUrl: data.url, pdfTitle: file.name.replace(/\.pdf$/i, "") }));
      if (previousUrl && previousUrl !== originalUrl && previousUrl !== data.url) await deleteUploadedPdf(previousUrl);
      success("PDF berhasil diunggah.");
    } catch (err: any) {
      error(err.message || "Terjadi kesalahan saat mengunggah PDF.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePdf = async () => {
    const currentUrl = form.pdfUrl;
    setForm((prev) => ({ ...prev, pdfUrl: "", pdfTitle: "" }));
    const originalUrl = modules.find((module) => module.id === editingId)?.pdfUrl;
    if (currentUrl && currentUrl !== originalUrl) await deleteUploadedPdf(currentUrl);
  };

  const handlePdfUrlChange = (url: string) => {
    const previousUrl = form.pdfUrl;
    const originalUrl = modules.find((module) => module.id === editingId)?.pdfUrl;
    setForm((prev) => ({ ...prev, pdfUrl: url }));
    if (previousUrl.startsWith("/uploads/modules/") && previousUrl !== originalUrl) {
      void deleteUploadedPdf(previousUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const originalPdfUrl = modules.find((module) => module.id === editingId)?.pdfUrl;

    try {
      if (form.questions.length === 0) {
        throw new Error("Minimal tambahkan 1 soal pilihan ganda");
      }
      if (form.chapters.length === 0 || form.chapters.some((chapter) => !chapter.title.trim() || chapter.body.trim().length < 10)) {
        throw new Error("Isi judul dan materi minimal 10 karakter untuk setiap bagian.");
      }

      const response = await fetch("/api/admin/modules", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          title: form.title,
          subtitle: form.subtitle,
          description: form.description,
          order: Number(form.order),
          courseId: form.courseId || null,
          pdfTitle: form.pdfTitle || null,
          pdfUrl: form.pdfUrl || null,
          content: {
            summary: form.summary.trim() || form.description.trim(),
            chapters: form.chapters.map(({ title, body, tip }) => ({ title, body, ...(tip.trim() ? { tip } : {}) })),
          },
          questions: form.questions,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan modul");
      }

      setModules((prev) => [
        ...prev.filter((module) => module.id !== data.module.id),
        data.module,
      ].sort((a, b) => a.order - b.order));
      success(editingId ? "Modul dan kuis berhasil diperbarui." : "Modul dan soal berhasil dibuat.");
      if (originalPdfUrl && originalPdfUrl !== form.pdfUrl) await deleteUploadedPdf(originalPdfUrl);
      setEditingId(null);
      setForm(createEmptyForm(String(Math.min(20, Number(form.order) + 1))));
    } catch (err: any) {
      error(err.message || "Terjadi kesalahan saat membuat modul.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (module: ModuleItem) => {
    let content: { summary?: string; chapters?: Array<{ title?: string; body?: string; tip?: string }> } = {};
    try {
      content = JSON.parse(module.content);
    } catch {
      content = { summary: module.description, chapters: [{ title: "Materi", body: module.content }] };
    }
    setEditingId(module.id);
    setForm({
      title: module.title,
      subtitle: module.subtitle,
      description: module.description,
      order: String(module.order),
      courseId: module.courseId || "",
      summary: content.summary || module.description,
      chapters: content.chapters?.length
        ? content.chapters.map((chapter) => ({ title: chapter.title || "", body: chapter.body || "", tip: chapter.tip || "" }))
        : [emptyChapter()],
      pdfTitle: module.pdfTitle || "",
      pdfUrl: module.pdfUrl || "",
      questions: module.questions.map(({ question, optionA, optionB, optionC, optionD, correctAnswer, explanation }) => ({ question, optionA, optionB, optionC, optionD, correctAnswer, explanation })),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (module: ModuleItem) => {
    if (!window.confirm(`Hapus modul "${module.title}"? Modul dengan progress peserta akan ditolak oleh sistem.`)) return;
    try {
      const response = await fetch("/api/admin/modules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: module.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menghapus modul");
      const unsavedPdfUrl = editingId === module.id && form.pdfUrl !== module.pdfUrl ? form.pdfUrl : "";
      setModules((prev) => prev.filter((item) => item.id !== module.id));
      if (editingId === module.id) {
        setEditingId(null);
        setForm(createEmptyForm());
      }
      await deleteUploadedPdf(module.pdfUrl || "");
      if (unsavedPdfUrl) await deleteUploadedPdf(unsavedPdfUrl);
      success("Modul berhasil dihapus.");
    } catch (err: any) {
      error(err.message || "Terjadi kesalahan saat menghapus modul.");
    }
  };

  const handleCancelEdit = () => {
    const original = modules.find((module) => module.id === editingId)?.pdfUrl;
    if (form.pdfUrl && form.pdfUrl !== original) void deleteUploadedPdf(form.pdfUrl);
    setEditingId(null);
    setForm(createEmptyForm());
  };

  const moduleGroups = [
    {
      id: "free-course",
      title: "Public Speaking I · Basic",
      accessLabel: "Basic untuk semua",
      modules: modules.filter((module) => !module.courseId).sort((a, b) => a.order - b.order),
    },
    ...courses.map((course) => ({
      id: course.id,
      title: course.title,
      accessLabel: course.accessMode === "FREE" ? "Basic" : course.accessMode === "COMMUNITY" ? "Anggota komunitas" : "Kode redeem / premium",
      modules: modules.filter((module) => module.courseId === course.id).sort((a, b) => a.order - b.order),
    })),
  ];

  return (
    <div className="space-y-5">
      <Card className="border-slate-200/80 p-6">
        <div className="flex items-center gap-2 text-slate-900">
          <PlusCircle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-extrabold">{editingId ? "Edit Modul & Kuis" : "Tambah Modul Baru"}</h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Judul Modul</label>
              <input value={form.title} onChange={(e) => handleChange("title", e.target.value)} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Urutan</label>
              <input type="number" min="1" value={form.order} onChange={(e) => handleChange("order", e.target.value)} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Kelas tujuan</label>
            <select value={form.courseId} onChange={(event) => handleChange("courseId", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Lima modul Basic yang sudah ada</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.title} · {course.accessMode === "FREE" ? "Basic" : course.accessMode === "COMMUNITY" ? "Anggota komunitas" : "Kode redeem"}</option>)}
            </select>
            <p className="mt-1 text-xs text-slate-500">Materi baru akan mengikuti syarat akses kelas yang dipilih.</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Subjudul</label>
            <input value={form.subtitle} onChange={(e) => handleChange("subtitle", e.target.value)} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Deskripsi</label>
            <textarea rows={4} value={form.description} onChange={(e) => handleChange("description", e.target.value)} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 p-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Ringkasan materi</label>
              <textarea rows={3} value={form.summary} onChange={(e) => handleChange("summary", e.target.value)} placeholder="Tulis gambaran singkat materi modul" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-800">Materi pembelajaran</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => setForm((prev) => ({ ...prev, chapters: [...prev.chapters, emptyChapter()] }))}>
                <Plus className="mr-1 h-4 w-4" /> Tambah bagian
              </Button>
            </div>
            {form.chapters.map((chapter, index) => (
              <div key={index} className="space-y-2 rounded-lg bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-500">Bagian {index + 1}</span>
                  {form.chapters.length > 1 && <button type="button" title="Hapus bagian" onClick={() => setForm((prev) => ({ ...prev, chapters: prev.chapters.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}
                </div>
                <input value={chapter.title} onChange={(e) => handleChapterChange(index, "title", e.target.value)} required placeholder="Judul bagian" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <textarea value={chapter.body} onChange={(e) => handleChapterChange(index, "body", e.target.value)} required minLength={10} rows={4} placeholder="Tulis isi materi di sini" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <input value={chapter.tip} onChange={(e) => handleChapterChange(index, "tip", e.target.value)} placeholder="Tips praktis (opsional)" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Materi PDF</h3>
                <p className="text-xs text-slate-500">Tempel tautan PDF publik atau unggah file maksimal 20 MB.</p>
              </div>
              <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                <Upload className="h-4 w-4" /> {uploading ? "Mengunggah..." : "Pilih file PDF"}
                <input type="file" accept="application/pdf,.pdf" onChange={handlePdfUpload} disabled={uploading} className="sr-only" />
              </label>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">Judul materi PDF</label>
                <input value={form.pdfTitle} onChange={(e) => handleChange("pdfTitle", e.target.value)} placeholder="Contoh: Buku Panduan Public Speaking" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">Tautan PDF</label>
                <input type="url" value={form.pdfUrl.startsWith("/uploads/modules/") ? "" : form.pdfUrl} onChange={(e) => handlePdfUrlChange(e.target.value)} placeholder="https://..." className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <p className="mt-1 text-xs text-slate-500">Pastikan tautan dapat dibuka oleh peserta tanpa login.</p>
              </div>
            </div>
            {form.pdfUrl && (
              <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <a href={form.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-primary hover:underline">
                  <FileText className="h-4 w-4 shrink-0" /><span className="truncate">{form.pdfTitle || "Materi PDF terpasang"}</span>
                </a>
                <button type="button" onClick={handleRemovePdf} title="Lepas PDF" className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"><X className="h-4 w-4" /></button>
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Kuis pilihan ganda</h3>
                <p className="text-xs text-slate-500">Tambahkan pertanyaan dan empat pilihan jawaban.</p>
              </div>
              <Button type="button" variant="outline" size="sm" disabled={form.questions.length >= 50} onClick={() => setForm((prev) => ({ ...prev, questions: [...prev.questions, emptyQuestion()] }))}>
                <Plus className="mr-1 h-4 w-4" /> Tambah soal
              </Button>
            </div>
            {form.questions.map((question, index) => (
              <div key={index} className="space-y-3 rounded-lg bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-500">Soal {index + 1}</span>
                  {form.questions.length > 1 && <button type="button" title="Hapus soal" onClick={() => setForm((prev) => ({ ...prev, questions: prev.questions.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}
                </div>
                <textarea value={question.question} onChange={(e) => handleQuestionChange(index, "question", e.target.value)} required minLength={10} rows={2} placeholder="Tulis pertanyaan" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(["A", "B", "C", "D"] as const).map((option) => {
                    const field = `option${option}` as keyof Question;
                    return <label key={option} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3"><span className="text-xs font-bold text-slate-500">{option}</span><input value={question[field]} onChange={(e) => handleQuestionChange(index, field, e.target.value)} required placeholder={`Pilihan ${option}`} className="min-w-0 flex-1 border-0 py-2 text-sm outline-none" /></label>;
                  })}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="text-xs font-semibold text-slate-600">Jawaban benar
                    <select value={question.correctAnswer} onChange={(e) => handleQuestionChange(index, "correctAnswer", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                      <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-slate-600">Penjelasan jawaban
                    <input value={question.explanation} onChange={(e) => handleQuestionChange(index, "explanation", e.target.value)} required minLength={10} placeholder="Jelaskan alasan jawaban benar" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full">
            {editingId ? "Simpan Perubahan" : "Simpan Modul & Kuis"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" size="lg" onClick={handleCancelEdit} className="w-full">
              <X className="mr-2 h-4 w-4" /> Batalkan Edit
            </Button>
          )}
        </form>
      </Card>

      <div className="space-y-5">
        {moduleGroups.map((group, index) => (
          <section key={group.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className={`flex items-center justify-between gap-3 border-b px-4 py-3 ${index === 0 ? "border-sky-200 bg-sky-50" : "border-emerald-200 bg-emerald-50"}`}>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-extrabold text-slate-900">{group.title}</h2>
                <p className="mt-0.5 text-[11px] text-slate-600">{group.accessLabel} · {group.modules.length} modul</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-600">{group.modules.length} modul</span>
            </header>
            <div className="space-y-3 p-3 sm:p-4">
              {group.modules.map((module) => (
                <Card key={module.id} className="border-slate-200/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><BookOpenText className="h-5 w-5" /></div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-extrabold text-slate-900">{module.title}</h3>
                        <p className="text-xs text-slate-500">Modul {module.order}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button type="button" onClick={() => handleEdit(module)} title="Edit modul" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => handleDelete(module)} title="Hapus modul" className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">{module.questions.length} soal</span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{module.description}</p>
                  {module.pdfUrl ? (
                    <a href={module.pdfUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700"><FileText className="h-4 w-4" />{module.pdfTitle || "Unduh PDF modul"}</a>
                  ) : <p className="mt-3 text-xs text-slate-500">Belum ada PDF modul yang ditambahkan.</p>}
                </Card>
              ))}
              {!group.modules.length && <p className="px-2 py-4 text-xs text-slate-500">Belum ada modul di paket ini. Pilih paket ini pada form Tambah Modul Baru untuk memulai.</p>}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
