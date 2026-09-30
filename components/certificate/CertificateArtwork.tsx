import { BrandLogo } from "@/components/layout/BrandLogo";

interface CertificateArtworkProps {
  userName: string;
  certificateNumber: string;
  issueDate: Date | string;
  recipientMessage: string;
  gradientStart: string;
  gradientEnd: string;
  signatureName: string;
  signatureRole: string;
  courseTitle: string;
  className?: string;
}

export function CertificateArtwork({
  userName,
  certificateNumber,
  issueDate,
  recipientMessage,
  gradientStart,
  gradientEnd,
  signatureName,
  signatureRole,
  courseTitle,
  className = "",
}: CertificateArtworkProps) {
  return (
    <div className={`flex aspect-[1.414/1] min-h-[220px] flex-col overflow-hidden bg-white text-center text-slate-900 ${className}`}>
      <header
        className="shrink-0"
        style={{ height: "9.5%", background: `linear-gradient(90deg, ${gradientStart}, ${gradientEnd})` }}
        aria-hidden="true"
      >
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-3 py-1 text-slate-900 sm:px-8 sm:py-3">
        <div className="mb-1">
          <p className="font-serif text-base font-bold uppercase sm:text-2xl">Sertifikat</p>
          <p className="mt-0.5 break-all font-mono text-[8px] font-semibold text-slate-600 sm:text-xs">Nomor: {certificateNumber}</p>
        </div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:text-xs sm:tracking-[0.16em]">Diberikan kepada:</p>
        <h2 className="mt-0.5 break-words font-serif text-lg font-bold leading-tight sm:mt-1 sm:text-3xl">{userName}</h2>
        <p className="mt-1 max-w-2xl text-[9px] leading-tight text-slate-600 sm:mt-2 sm:text-sm sm:leading-relaxed">{recipientMessage}</p>
        <p className="mt-1 text-[10px] font-bold sm:mt-2 sm:text-base">{courseTitle}</p>
        <p className="mt-0.5 text-[8px] text-slate-600 sm:mt-1 sm:text-xs">
          Tanggal terbit: {new Date(issueDate).toLocaleDateString("id-ID", { dateStyle: "long" })}
        </p>

        <div className="mt-1 flex items-center justify-center gap-2 sm:mt-3 sm:gap-3">
          <BrandLogo className="h-6 max-w-[44px] sm:h-9 sm:max-w-[64px]" />
          <div className="text-left">
            <p className="text-[9px] font-bold sm:text-sm">{signatureName}</p>
            <p className="text-[8px] text-slate-600 sm:text-xs">{signatureRole}</p>
          </div>
        </div>
      </main>

      <div
        className="shrink-0"
        style={{ height: "9.5%", background: `linear-gradient(90deg, ${gradientStart}, ${gradientEnd})` }}
        aria-hidden="true"
      />
    </div>
  );
}