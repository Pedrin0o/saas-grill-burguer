"use client";

import { IconMenu } from "./icons";
import { LogoutButton } from "@/components/LogoutButton";

type TopbarProps = {
  onOpenMenu: () => void;
  userEmailSlot?: React.ReactNode;
};

export function Topbar({ onOpenMenu, userEmailSlot }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/5 bg-[var(--paper)]/90 px-5 py-4 backdrop-blur">
      <button
        onClick={onOpenMenu}
        className="rounded-lg p-2 text-[var(--text-h-light)] hover:bg-black/5 lg:hidden"
        aria-label="Abrir menu"
      >
        <IconMenu className="h-5 w-5" />
      </button>

      <div className="hidden text-sm text-[var(--text-on-light)] opacity-70 lg:block">
        Painel administrativo
      </div>

      <div className="flex items-center gap-4">
        {userEmailSlot}
        <LogoutButton />
      </div>
    </header>
  );
}