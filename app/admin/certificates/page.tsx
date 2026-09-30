export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { CertificateTemplateManager, CertificateTemplateDraft } from "@/components/admin/CertificateTemplateManager";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrCreateCertificateTemplate } from "@/lib/certificate/templates";
import prisma from "@/lib/db/prisma";

export default async function AdminCertificatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/beranda");

  const [courses, certificates, courseCertificates] = await Promise.all([
    prisma.learningCourse.findMany({
      where: { isActive: true, certificateEnabled: true },
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true },
    }),
    prisma.certificate.findMany({
      orderBy: { issueDate: "desc" },
      include: { user: true },
    }),
    prisma.courseCertificate.findMany({
      orderBy: { issueDate: "desc" },
      include: { user: true, course: true },
    }),
  ]);
  const templateRecords = await Promise.all([
    getOrCreateCertificateTemplate(null, "Public Speaking I"),
    ...courses.map((course) => getOrCreateCertificateTemplate(course.id, course.title)),
  ]);
  const templates: CertificateTemplateDraft[] = templateRecords.map((template, index) => ({
    scopeKey: template.scopeKey,
    label: index === 0 ? "Public Speaking I · Kelas Basic" : courses[index - 1].title,
    courseCode: template.courseCode,
    gradientStart: template.gradientStart,
    gradientEnd: template.gradientEnd,
    recipientMessage: template.recipientMessage,
    signatureName: template.signatureName,
    signatureRole: template.signatureRole,
  }));
  const issuedRecords = [
    ...certificates.map((certificate) => ({ ...certificate, courseTitle: "Public Speaking I · Kelas Basic", type: "Program" })),
    ...courseCertificates.map((certificate) => ({ ...certificate, courseTitle: certificate.course.title, type: "Kelas" })),
  ].sort((left, right) => right.issueDate.getTime() - left.issueDate.getTime());

  return (
    <AppShell user={user}>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Sertifikat</h1>
        </div>

        <CertificateTemplateManager initialTemplates={templates} />

        <Card className="overflow-hidden border-slate-200/80">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-extrabold text-slate-900">Riwayat Sertifikat Terbit</h2>
            <p className="mt-1 text-xs text-slate-500">Status unduhan PDF dan tanggal terbit untuk setiap peserta.</p>
          </div>
          {issuedRecords.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nomor</th>
                    <th className="px-4 py-3 font-semibold">Kelas</th>
                    <th className="px-4 py-3 font-semibold">Peserta</th>
                    <th className="px-4 py-3 font-semibold">Tanggal terbit</th>
                    <th className="px-4 py-3 font-semibold">Unduhan PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedRecords.map((record) => (
                    <tr key={`${record.type}-${record.id}`} className="border-t border-slate-100 align-top">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-slate-800">{record.certificateNumber}</td>
                      <td className="px-4 py-3 text-slate-700">{record.courseTitle}</td>
                      <td className="px-4 py-3"><p className="font-semibold text-slate-800">{record.recipientName}</p><p className="text-xs text-slate-500">{record.user.email}</p></td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{new Date(record.issueDate).toLocaleDateString("id-ID")}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {record.downloadCount ? <><span className="font-semibold text-emerald-700">Diunduh {record.downloadCount}x</span><p className="mt-1 text-xs text-slate-500">Terakhir {record.lastDownloadedAt ? new Date(record.lastDownloadedAt).toLocaleString("id-ID") : "-"}</p></> : <span className="text-slate-400">Belum diunduh</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-500">Belum ada sertifikat yang diterbitkan.</p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
