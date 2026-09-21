"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { IconLogout } from "@/components/admin/icons";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-sm text-[var(--text-h-light)] transition-colors hover:bg-black/5"
    >
      <IconLogout className="h-4 w-4" />
      <span className="hidden sm:inline">Sair</span>
    </button>
  );
}