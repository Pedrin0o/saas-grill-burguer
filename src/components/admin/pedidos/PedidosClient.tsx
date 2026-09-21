"use client";

import { useState } from "react";
import { KdsBoard } from "./KdsBoard";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/orderStatus";


type OrderItem = {
  productName: string;
  quantity: number;
  priceCents: number;
};

type Order = {
  id: string;
  customerName: string;
  totalCents: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

type Product = {
  id: string;
  name: string;
  priceCents: number;
};

type SaleLine = { productId: string; quantity: number };

type PedidosClientProps = {
  initialOrders: Order[];
  availableProducts: Product[];
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function PedidosClient({
  initialOrders,
  availableProducts,
}: PedidosClientProps) {
   const [orders, setOrders] = useState(initialOrders);
  const [view, setView] = useState<"lista" | "cozinha">("lista");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [lines, setLines] = useState<SaleLine[]>([
    { productId: availableProducts[0]?.id ?? "", quantity: 1 },
  ]);

  function updateLine(index: number, patch: Partial<SaleLine>) {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, ...patch } : line))
    );
  }

  function addLine() {
    setLines((prev) => [
      ...prev,
      { productId: availableProducts[0]?.id ?? "", quantity: 1 },
    ]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const totalPreview = lines.reduce((sum, line) => {
    const product = availableProducts.find((p) => p.id === line.productId);
    return sum + (product ? product.priceCents * line.quantity : 0);
  }, 0);

  function resetForm() {
    setCustomerName("");
    setCustomerPhone("");
    setLines([{ productId: availableProducts[0]?.id ?? "", quantity: 1 }]);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || lines.length === 0) {
      setError("Informe o nome do cliente e ao menos um produto.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          items: lines,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Erro ao registrar venda.");
      }

      const created = await res.json();
      setOrders((prev) => [
        {
          id: created.id,
          customerName: created.customerName,
          totalCents: created.totalCents,
          status: created.status,
          createdAt: created.createdAt,
          items: created.items.map((i: { product: { name: string }; quantity: number; priceCents: number }) => ({
            productName: i.product.name,
            quantity: i.quantity,
            priceCents: i.priceCents,
          })),
        },
        ...prev,
      ]);

      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-h-light)]">
            Pedidos
          </h1>
          <p className="mt-1 text-sm text-[var(--text-on-light)] opacity-70">
            Vendas registradas — do balcão ou do cardápio digital.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-full bg-[var(--paper-soft)] p-1">
            <button
              onClick={() => setView("lista")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                view === "lista" ? "bg-white text-[var(--text-h-light)] shadow-sm" : "text-[var(--text-on-light)]"
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setView("cozinha")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                view === "cozinha" ? "bg-white text-[var(--text-h-light)] shadow-sm" : "text-[var(--text-on-light)]"
              }`}
            >
              Cozinha (KDS)
            </button>
          </div>

          <button
            onClick={() => setShowForm((v) => !v)}
            disabled={availableProducts.length === 0}
            className="rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] px-5 py-2.5 text-sm font-semibold text-[#1c1006] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {showForm ? "Cancelar" : "+ Registrar venda"}
          </button>
        </div>
      </div>

      {availableProducts.length === 0 && (
        <p className="rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-3 text-sm text-[var(--gold-deep)]">
          Cadastre pelo menos um produto no Cardápio antes de registrar uma
          venda.
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl bg-white p-6 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">
                Cliente
              </label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">
                Telefone (opcional)
              </label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
                placeholder="(11) 99999-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-[var(--text-on-light)]">
              Itens do pedido
            </label>

            {lines.map((line, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={line.productId}
                  onChange={(e) =>
                    updateLine(index, { productId: e.target.value })
                  }
                  className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
                >
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.priceCents)}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) =>
                    updateLine(index, {
                      quantity: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-20 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
                />

                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    className="text-xs text-[var(--danger)] hover:underline"
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addLine}
              className="text-xs font-medium text-[var(--gold-deep)] hover:underline"
            >
              + adicionar outro item
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-black/5 pt-4">
            <p className="text-sm text-[var(--text-on-light)]">
              Total:{" "}
              <span className="text-base font-semibold text-[var(--text-h-light)]">
                {formatCurrency(totalPreview)}
              </span>
            </p>

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] px-5 py-2.5 text-sm font-semibold text-[#1c1006] disabled:opacity-60"
            >
              {saving ? "Registrando..." : "Confirmar venda"}
            </button>
          </div>

          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        </form>
      )}

      {view === "cozinha" ? (
        <KdsBoard />
      ) : (
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-[var(--text-on-light)] opacity-60">
            Nenhum pedido registrado ainda.
          </p>
        ) : (
          <ul className="divide-y divide-black/5">
            {orders.map((order) => (
              <li key={order.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--text-h-light)]">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-[var(--text-on-light)] opacity-60">
                      {new Date(order.createdAt).toLocaleString("pt-BR")} ·{" "}
                      {order.items
                        .map((i) => `${i.quantity}x ${i.productName}`)
                        .join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[var(--text-h-light)]">
                      {formatCurrency(order.totalCents)}
                    </p>
                    <p
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] ?? ""
                      }`}
                    >
                      {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ?? order.status}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
         )}
      </div>
      )}
    </div>
  );
}