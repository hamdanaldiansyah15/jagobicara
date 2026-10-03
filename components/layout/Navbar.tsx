"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Trophy,
  FileText,
  Shield,
  Users,
  LogOut,
  Menu,
  X,
  UserRound,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export interface NavbarUser {
  id: string;
  name: string;
  email: string;
  role: "PARTICIPANT" | "COMMUNITY_ADMIN" | "SUPER_ADMIN";
  community?: { name: string; code: string } | null;
}

interface NavbarProps {
  user?: NavbarUser | null;
  authLoading?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ user, authLoading = false }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  const navLinks = [
    { label: "Beranda", href: "/beranda" },
    { label: "Bicara", href: "/bicara" },
    { label: "Modulku", href: "/modulku" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Buat Naskah", href: "/naskah" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={user ? "/beranda" : "/"} aria-label="Jago Bicara" className="flex shrink-0 items-center">
          <BrandLogo className="h-14 max-w-[220px] sm:h-16" priority />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {user &&
            navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/beranda" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary bg-primary-light font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

          {/* Role-based Admin Links */}
          {user?.role === "COMMUNITY_ADMIN" && (
            <Link
              href="/community-admin"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                pathname.startsWith("/community-admin")
                  ? "bg-sky-100 text-sky-800"
                  : "text-sky-700 hover:bg-sky-50"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Admin Komunitas</span>
            </Link>
          )}

          {user?.role === "SUPER_ADMIN" && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-primary-light text-primary"
                  : "text-primary hover:bg-primary-light"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Super Admin</span>
            </Link>
          )}
        </nav>

        {/* User Right Action / Login */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800">{user.name}</span>
                <span className="text-[11px] text-slate-500">
                  {user.community?.name || "Peserta"}
                </span>
              </div>

              <Link
                href="/akun"
                aria-label="Akun"
                className="hidden lg:flex w-9 h-9 rounded-full bg-slate-100 border border-slate-200 items-center justify-center font-bold text-sm text-primary hover:ring-2 hover:ring-primary/20 transition-all"
              >
                {user.name.charAt(0).toUpperCase()}
              </Link>

              <button
                onClick={handleLogout}
                className="hidden lg:flex p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : !authLoading ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all"
              >
                Daftar
              </Link>
            </div>
          ) : null}

          {/* Mobile hamburger menu toggle */}
          {user && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileMenuOpen}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && user && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2">
          <div className="py-2 border-b border-slate-100 mb-2">
            <p className="text-sm font-bold text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
            {user.community && (
              <span className="inline-block mt-1 text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                {user.community.name} ({user.community.code})
              </span>
            )}
          </div>

          <Link
            href="/akun"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"
          >
            <UserRound className="w-4 h-4 text-primary" />
            <span>Akun</span>
          </Link>

          <Link
            href="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Leaderboard Season Ini</span>
          </Link>
          <Link
            href="/naskah"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"
          >
            <FileText className="w-4 h-4 text-primary" />
            <span>Buat Naskah (MC, Pidato, dll)</span>
          </Link>

          {user.role === "COMMUNITY_ADMIN" && (
            <Link
              href="/community-admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-sky-700 rounded-lg bg-sky-50"
            >
              <Users className="w-4 h-4" />
              <span>Dashboard Admin Komunitas</span>
            </Link>
          )}

          {user.role === "SUPER_ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-primary rounded-lg bg-primary-light"
            >
              <Shield className="w-4 h-4" />
              <span>Dashboard Super Admin</span>
            </Link>
          )}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
