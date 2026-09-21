"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconHome,
  IconBurger,
  IconClipboard,
  IconWallet,
  IconBoxes,
  IconRadar,
  IconWhatsapp,
  IconSparkles,
  IconX,
} from "./icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Início", icon: IconHome },
  { href: "/produtos", label: "Cardápio", icon: IconBurger },
  { href: "/pedidos", label: "Pedidos", icon: IconClipboard },
  { href: "/financeiro", label: "Financeiro", icon: IconWallet },
  { href: "/estoque", label: "Estoque", icon: IconBoxes },
  { href: "/rivalidades", label: "Rivalidades", icon: IconRadar },
  { href: "/whatsapp", label: "WhatsApp", icon: IconWhatsapp },
  { href: "/ia", label: "IA", icon: IconSparkles },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const LOW_STOCK_THRESHOLD = 5;

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    fetch("/api/ingredientes")
      .then((res) => res.json())
      .then((ingredients: { quantity: number }[]) => {
        setLowStockCount(ingredients.filter((i) => i.quantity <= LOW_STOCK_THRESHOLD).length);
      })
      .catch(() => {});
  }, [pathname]); // reconsulta ao trocar de tela

  return (
    <>
      {/* fundo escurecido no mobile quando o menu está aberto */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col
          bg-[var(--ink)] text-[var(--text-on-dark)]
          transition-transform duration-200 ease-out
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-wide text-[#f6efe4]">
              SMASH
            </span>
            <small className="mt-1 text-[10px] tracking-[2.5px] text-[var(--gold)]">
              BURGER HOUSE
            </small>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-on-dark)] hover:bg-white/5 lg:hidden"
            aria-label="Fechar menu"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors
                  ${
                    active
                      ? "bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] text-[#1c1006] font-semibold"
                      : "text-[var(--text-on-dark)] hover:bg-white/5"
                  }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.href === "/estoque" && lowStockCount > 0 && (
                  <span className="rounded-full bg-[var(--danger)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {lowStockCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-6 py-4 text-[11px] text-[var(--text-on-dark)] opacity-60">
          Smash Burger House © 2026
        </div>
      </aside>
    </>
  );
}