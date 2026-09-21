"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type AdminShellProps = {
  children: React.ReactNode;
  userEmailSlot?: React.ReactNode;
};

export function AdminShell({ children, userEmailSlot }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-svh bg-[var(--paper)]">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-[260px]">
        <Topbar onOpenMenu={() => setMenuOpen(true)} userEmailSlot={userEmailSlot} />
        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}