"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Mic, BookOpen, User } from "lucide-react";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  // Exactly four main bottom navigation items as per instructions
  const navItems = [
    { label: "Beranda", href: "/beranda", icon: Home },
    { label: "Bicara", href: "/bicara", icon: Mic },
    { label: "Modulku", href: "/modulku", icon: BookOpen },
    { label: "Akun", href: "/akun", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 md:hidden shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== "/beranda" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all duration-150 min-h-[52px] ${
                isActive
                  ? "text-primary font-bold"
                  : "text-slate-500 hover:text-slate-700 font-medium"
              }`}
            >
              <div
                className={`p-1.5 rounded-full transition-transform ${
                  isActive ? "bg-primary-light scale-105 text-primary" : ""
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
