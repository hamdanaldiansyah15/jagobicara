"use client";

import React, { useEffect, useState } from "react";
import { Navbar, NavbarUser } from "./Navbar";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  user?: NavbarUser | null;
  showBottomNav?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  user,
  showBottomNav = true,
}) => {
  const [sessionUser, setSessionUser] = useState<NavbarUser | null>(user ?? null);
  const [authLoading, setAuthLoading] = useState(user === undefined);

  useEffect(() => {
    if (user !== undefined) {
      setSessionUser(user);
      setAuthLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401) {
          setSessionUser(null);
          return;
        }
        if (!response.ok) {
          throw new Error(`Gagal memeriksa sesi pengguna (${response.status}).`);
        }

        const data: { user?: NavbarUser | null } = await response.json();
        if (!data.user) {
          throw new Error("Respons sesi pengguna tidak berisi data pengguna.");
        }
        setSessionUser(data.user);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Gagal memuat sesi pada AppShell:", error);
          setSessionUser(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setAuthLoading(false);
        }
      }
    };

    void loadSession();
    return () => controller.abort();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-content-body">
      <Navbar user={sessionUser} authLoading={authLoading} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {children}
      </main>
      {showBottomNav && sessionUser && <BottomNav />}
    </div>
  );
};
