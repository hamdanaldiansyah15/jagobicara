"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  user?: any;
  showBottomNav?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  user,
  showBottomNav = true,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-content-body">
      <Navbar user={user} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {children}
      </main>
      {showBottomNav && user && <BottomNav />}
    </div>
  );
};
