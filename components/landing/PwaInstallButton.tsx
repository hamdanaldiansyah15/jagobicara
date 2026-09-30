"use client";

import { useEffect, useState } from "react";
import { Download, Monitor, Smartphone } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

type InstallPlatform = "ios" | "android" | "desktop";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const platformLabels: Record<InstallPlatform, string> = {
  ios: "iPhone / iPad",
  android: "Android",
  desktop: "PC / Mac",
};

const installSteps: Record<InstallPlatform, string[]> = {
  ios: [
    "Buka Jago Bicara melalui Safari.",
    "Ketuk tombol Bagikan di bilah Safari.",
    "Pilih Tambahkan ke Layar Utama, lalu ketuk Tambah.",
  ],
  android: [
    "Buka Jago Bicara melalui Chrome.",
    "Ketuk menu tiga titik di kanan atas.",
    "Pilih Instal aplikasi atau Tambahkan ke layar utama, lalu konfirmasi.",
  ],
  desktop: [
    "Buka Jago Bicara melalui Chrome atau Microsoft Edge.",
    "Chrome: klik ikon instal di bilah alamat atau buka menu ⋮ lalu pilih Instal halaman sebagai aplikasi. Edge: buka menu ⋯, pilih Aplikasi, lalu Instal situs ini sebagai aplikasi.",
    "Konfirmasi pemasangan. Jago Bicara akan tersedia dari desktop atau menu aplikasi.",
  ],
};

function detectPlatform(): InstallPlatform {
  const userAgent = navigator.userAgent;
  const isAppleMobile = /iPhone|iPad|iPod/i.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isAppleMobile) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "desktop";
}

export function PwaInstallButton() {
  const [platform, setPlatform] = useState<InstallPlatform>("desktop");
  const [isOpen, setIsOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());

    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    if (standaloneQuery.matches || ("standalone" in navigator && navigator.standalone)) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setIsOpen(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    const promptEvent = installPrompt;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setInstallPrompt(null);
    if (choice.outcome === "accepted") setIsInstalled(true);
  };

  if (isInstalled) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#31584f]/25 bg-white px-5 py-3 text-sm font-bold text-[#31584f] transition-colors hover:border-[#31584f]/50 hover:bg-emerald-50 sm:w-auto"
      >
        <Download className="h-4 w-4" />
        Pasang aplikasi
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Pasang Jago Bicara" maxWidth="md">
        <p className="text-sm leading-6 text-slate-600">
          Buka Jago Bicara dari layar utama seperti aplikasi lain. Pilih perangkatmu untuk melihat langkah pemasangan.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Pilih perangkat">
          {(["ios", "android", "desktop"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={platform === item}
              onClick={() => setPlatform(item)}
              className={`min-h-10 rounded-md px-2 text-xs font-bold transition-colors ${platform === item ? "bg-white text-[#24483f] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              {platformLabels[item]}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3 border-l-[3px] border-[#31584f] bg-[#f3f7f4] px-4 py-3">
          {platform === "desktop" ? <Monitor className="h-5 w-5 shrink-0 text-[#31584f]" /> : <Smartphone className="h-5 w-5 shrink-0 text-[#31584f]" />}
          <p className="text-sm font-bold text-slate-800">Langkah untuk {platformLabels[platform]}</p>
        </div>

        <ol className="mt-4 space-y-3">
          {installSteps[platform].map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-sm leading-5 text-slate-600">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#31584f] text-xs font-bold text-white">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        {installPrompt && platform !== "ios" && (
          <button
            type="button"
            onClick={handleInstall}
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#31584f] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#24483f]"
          >
            <Download className="h-4 w-4" /> Instal sekarang
          </button>
        )}
      </Modal>
    </>
  );
}