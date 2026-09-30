"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

export function CommunityJoinForm() {
  const router = useRouter();
  const { success, error } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/communities/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal bergabung dengan komunitas.");
      success(data.message || "Berhasil bergabung dengan komunitas.");
      setCode("");
      router.refresh();
    } catch (err) {
      error(err instanceof Error ? err.message : "Gagal bergabung dengan komunitas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200/80 p-6">
      <div className="flex items-center gap-2 text-slate-900">
        <Users className="h-5 w-5 text-[#31584f]" />
        <h2 className="text-lg font-extrabold">Masukkan kode komunitas</h2>
      </div>
      <p className="mt-2 text-sm text-slate-600">Bergabunglah dengan komunitas untuk berlatih dan berkembang bersama.</p>
      <form onSubmit={handleJoin} className="mt-5 space-y-4">
        <label className="block text-xs font-bold text-slate-700" htmlFor="community-code">Kode komunitas</label>
        <input
          id="community-code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Contoh: SIMBANG26"
          autoComplete="off"
          required
          className="-mt-3 block w-full rounded-lg border border-slate-200 px-3 py-3 text-sm uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#31584f]"
        />
        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
          <KeyRound className="mr-2 h-4 w-4" /> Gabung Komunitas
        </Button>
      </form>
    </Card>
  );
}