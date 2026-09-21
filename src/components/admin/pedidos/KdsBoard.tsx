"use client";

import { useEffect, useState, useCallback } from "react";
import { ORDER_STATUS_LABELS, nextStatus } from "@/lib/orderStatus";

type OrderItem = { productName: string; quantity: number };
type KdsStatus = "PAGO" | "EM_PREPARO" | "PRONTO";
type KdsOrder = {
  id: string;
  customerName: string;
  status: KdsStatus;
  createdAt: string;
  items: OrderItem[];
};

const COLUMNS: KdsStatus[] = ["PAGO", "EM_PREPARO", "PRONTO"];

function minutesAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diffMs / 60000));
}

export function KdsBoard() {
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(() => {
    fetch("/api/pedidos")
      .then((res) => res.json())
      .then((data: any[]) => {
        const active = data
          .filter((o) => COLUMNS.includes(o.status))
          .map((o) => ({
            id: o.id,
            customerName: o.customerName,
            status: o.status as KdsStatus,
            createdAt: o.createdAt,
            items: o.items.map((i: any) => ({
              productName: i.product.name,
              quantity: i.quantity,
            })),
          }));
        setOrders(active);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadOrders();
    // atualiza sozinho a cada 20s — a cozinha não precisa ficar recarregando a página
    const interval = setInterval(loadOrders, 20000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  async function advance(order: KdsOrder) {
    const next = nextStatus(order.status);
    if (!next) return;

    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: next as KdsStatus } : o))
    );

    const res = await fetch(`/api/pedidos/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });

    if (!res.ok) loadOrders(); // desfaz a mudança otimista se der erro
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col} className="h-64 animate-pulse rounded-2xl bg-black/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {COLUMNS.map((status) => {
        const columnOrders = orders.filter((o) => o.status === status);
        return (
          <div key={status} className="rounded-2xl bg-[var(--paper-soft)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text-h-light)]">
                {ORDER_STATUS_LABELS[status]}
              </h3>
              <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs font-semibold text-[var(--text-on-light)]">
                {columnOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {columnOrders.length === 0 ? (
                <p className="text-xs text-[var(--text-on-light)] opacity-50">Nenhum pedido aqui.</p>
              ) : (
                columnOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => advance(order)}
                    className="w-full rounded-xl bg-white p-4 text-left shadow-[0_10px_24px_-16px_rgba(28,20,12,0.3)] transition-transform hover:-translate-y-0.5"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-semibold text-[var(--text-h-light)]">{order.customerName}</p>
                      <span className="text-xs text-[var(--text-on-light)] opacity-50">
                        {minutesAgo(order.createdAt)} min
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-on-light)] opacity-70">
                      {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold text-[var(--gold-deep)]">
                      Toque para avançar →
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}