"use client";

import React, { useState } from "react";
import { Copy, Check, Printer, Download, Edit3, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

interface ScriptViewerProps {
  title: string;
  initialContent: string;
  onReset: () => void;
}

export const ScriptViewer: React.FC<ScriptViewerProps> = ({
  title,
  initialContent,
  onReset,
}) => {
  const { success: toastSuccess } = useToast();
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toastSuccess("Naskah berhasil disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toastSuccess("Naskah berhasil diunduh sebagai file .txt!");
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs print:hidden">
        <div className="flex items-center gap-1.5">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 mr-1.5" />
            )}
            <span>{copied ? "Tersalin" : "Salin Naskah"}</span>
          </Button>

          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "primary" : "outline"}
            size="sm"
            className="text-xs"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            <span>{isEditing ? "Selesai Edit" : "Edit Naskah"}</span>
          </Button>

          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="text-xs hidden sm:inline-flex"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>Unduh (.txt)</span>
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="text-xs hidden sm:inline-flex"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            <span>Cetak</span>
          </Button>
        </div>

        <Button
          onClick={onReset}
          variant="ghost"
          size="sm"
          className="text-xs text-slate-500 hover:text-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          <span>Buat Ulang</span>
        </Button>
      </div>

      {/* Document View */}
      <Card className="border-slate-200/90 shadow-card bg-white p-6 sm:p-10 font-sans leading-relaxed text-slate-800">
        <div className="border-b border-slate-200 pb-4 mb-6 text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            JAGO BICARA — DOKUMEN NASKAH
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{title}</h2>
        </div>

        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={22}
            className="w-full p-4 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        ) : (
          <div className="prose prose-sm max-w-none text-xs sm:text-sm whitespace-pre-wrap font-normal leading-relaxed text-slate-700">
            {content}
          </div>
        )}
      </Card>
    </div>
  );
};
