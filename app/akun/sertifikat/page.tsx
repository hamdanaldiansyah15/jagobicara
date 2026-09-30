export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Award } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { CertificateDownloadCard } from "@/components/certificate/CertificateDownloadCard";
import { BASIC_CERTIFICATE_SCOPE } from "@/lib/certificate/templates";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export default async function AccountCertificatePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [certificate, courseCertificates, totalModules, basicTemplate] = await Promise.all([
    prisma.certificate.findUnique({ where: { userId: user.id } }),
    prisma.courseCertificate.findMany({
      where: { userId: user.id },
      include: { course: { include: { certificateTemplates: true } } },
      orderBy: { issueDate: "desc" },
    }),
    prisma.module.count({ where: { courseId: null } }),
    prisma.certificateTemplate.findUnique({ where: { scopeKey: BASIC_CERTIFICATE_SCOPE } }),
  ]);

  return (
    <AppShell user={user}>
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/akun" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Sertifikat Saya</h1>
        </div>

        {!certificate && courseCertificates.length === 0 ? (
          <Card className="border-slate-200/80 p-6">
            <div className="flex items-center gap-3 text-amber-700">
              <Award className="h-6 w-6" />
              <p className="font-semibold">Selesaikan seluruh {totalModules} modul untuk mendapatkan sertifikat.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
          {certificate && (
          <CertificateDownloadCard
            certificateId={certificate.id}
            certificateType="PROGRAM"
            userName={user.name}
            certificateNumber={certificate.certificateNumber}
            issueDate={certificate.issueDate}
            recipientMessage={basicTemplate?.recipientMessage ?? certificate.recipientMessage}
            gradientStart={basicTemplate?.gradientStart ?? certificate.gradientStart}
            gradientEnd={basicTemplate?.gradientEnd ?? certificate.gradientEnd}
            signatureName={basicTemplate?.signatureName ?? certificate.signatureName}
            signatureRole={basicTemplate?.signatureRole ?? certificate.signatureRole}
            courseTitle="Public Speaking I · Kelas Basic"
          />
          )}
          {courseCertificates.map((courseCertificate) => {
            const template = courseCertificate.course.certificateTemplates.find(
              (item) => item.scopeKey === `course:${courseCertificate.courseId}`,
            );
            return (
              <CertificateDownloadCard
                key={courseCertificate.id}
                certificateId={courseCertificate.id}
                certificateType="COURSE"
                userName={user.name}
                certificateNumber={courseCertificate.certificateNumber}
                issueDate={courseCertificate.issueDate}
                recipientMessage={template?.recipientMessage ?? courseCertificate.recipientMessage}
                gradientStart={template?.gradientStart ?? courseCertificate.gradientStart}
                gradientEnd={template?.gradientEnd ?? courseCertificate.gradientEnd}
                signatureName={template?.signatureName ?? courseCertificate.signatureName}
                signatureRole={template?.signatureRole ?? courseCertificate.signatureRole}
                courseTitle={courseCertificate.course.title}
              />
            );
          })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
