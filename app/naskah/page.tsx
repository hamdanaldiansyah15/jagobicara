export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Mic,
  MessageSquare,
  Users2,
  Presentation,
  ChevronRight,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";

export default async function NaskahOverviewPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const scriptTypes = [
    {
      title: "Naskah Master of Ceremony (MC)",
      href: "/naskah/mc",
      icon: Mic,
      tag: "Protokoler & Santai",
      desc: "Susun panduan lengkap pembawa acara dari pembukaan, penghormatan tamu, susunan agenda, hingga bridging tiap sesi.",
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Kata Sambutan",
      href: "/naskah/sambutan",
      icon: MessageSquare,
      tag: "Ketua & Perwakilan",
      desc: "Rancang pidato sambutan mewakili panitia, organisasi, atau tamu kehormatan dengan pesan apresiatif dan berbobot.",
      color: "from-sky-500 to-blue-600",
    },
    {
      title: "Pemandu Diskusi (Moderator)",
      href: "/naskah/moderator",
      icon: Users2,
      tag: "Talkshow & Seminar",
      desc: "Kerangka terstruktur untuk mengenalkan narasumber, menetapkan tata tertib, memandu tanya-jawab, dan membuat kesimpulan.",
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "Pidato & Presentasi Gagasan",
      href: "/naskah/presentasi",
      icon: Presentation,
      tag: "Inspiratif & Persuasif",
      desc: "Susun presentasi dengan teknik Hook pembuka yang memikat, Rule of Three pada isi, dan Call to Action yang menggerakkan.",
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <AppShell user={user}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-[#31584f]">Generator Naskah Mandiri</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pilih Jenis Naskah Berbicara
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
            Hasilkan draf naskah yang adaptif dan siap pakai sesuai konteks acara dan gaya bicaramu.
          </p>
        </div>

        {/* Script Type Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scriptTypes.map((st, i) => {
            const Icon = st.icon;
            return (
              <Link
                key={i}
                href={st.href}
                className="bg-white rounded-card p-6 border border-slate-200/80 shadow-card hover:shadow-elevated hover:border-primary/40 hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${st.color} text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-light px-2.5 py-0.5 rounded-full">
                    {st.tag}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                  <span>Mulai Susun Naskah</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
