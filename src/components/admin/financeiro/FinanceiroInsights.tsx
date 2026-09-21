"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { StatCard } from "@/components/admin/StatCard";

type HourBucket = { hour: number; label: string; count: number; revenue: number };
type WeekdayBucket = { day: number; label: string; count: number; revenue: number };
type TopProduct = { productId: string; name: string; quantity: number; revenueCents: number };

type InsightsData = {
  days: number;
  orderCount: number;
  totalRevenueCents: number;
  avgTicketCents: number;
  byHour: HourBucket[];
  byWeekday: WeekdayBucket[];
  peakHour: HourBucket | null;
  peakWeekday: WeekdayBucket | null;
  topProducts: TopProduct[];
};

type Period = 7 | 30 | 90;

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

type FinanceiroInsightsProps = {
  refreshKey?: number;
};

export function FinanceiroInsights({ refreshKey = 0 }: FinanceiroInsightsProps) {
  const [period, setPeriod] = useState<Period>(30);
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/financeiro/insights?days=${period}`)
      .then((res) => res.json())
      .then((json: InsightsData) => {
        if (!cancelled) setData(json);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period, refreshKey]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-[var(--text-h-light)]">
          Comportamento de vendas
        </h2>

        <div className="flex gap-1.5">
          {([7, 30, 90] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                period === p
                  ? "bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] text-[#1c1006]"
                  : "bg-[var(--paper-soft)] text-[var(--text-on-light)] hover:bg-black/5"
              }`}
            >
              {p} dias
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="flex h-[200px] animate-pulse items-center justify-center rounded-2xl bg-black/5 text-sm text-[var(--text-on-light)] opacity-50">
          Carregando...
        </div>
      ) : data.orderCount === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-2xl bg-white text-sm text-[var(--text-on-light)] opacity-60 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
          Nenhum pedido pago nesse período.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <StatCard
              label="Ticket médio"
              value={formatCurrency(data.avgTicketCents)}
              hint={`${data.orderCount} pedidos no período`}
            />
            <StatCard
              label="Horário de pico"
              value={data.peakHour ? data.peakHour.label : "—"}
              hint={data.peakHour ? `${data.peakHour.count} pedidos nesse horário` : "sem dados suficientes"}
            />
            <StatCard
              label="Dia mais forte"
              value={data.peakWeekday ? data.peakWeekday.label : "—"}
              hint={data.peakWeekday ? `${data.peakWeekday.count} pedidos nesse dia` : "sem dados suficientes"}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
              <h3 className="mb-4 text-sm font-semibold text-[var(--text-h-light)]">Pedidos por horário</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.byHour}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#3a2f24" }}
                    axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#3a2f24" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [`${value} pedidos`, ""]}
                    labelFormatter={(label) => `Horário: ${label}`}
                    contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", fontSize: 13 }}
                  />
                  <Bar dataKey="count" fill="#e8a86b" radius={[4, 4, 0, 0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
              <h3 className="mb-4 text-sm font-semibold text-[var(--text-h-light)]">Pedidos por dia da semana</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.byWeekday}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#3a2f24" }}
                    axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#3a2f24" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [`${value} pedidos`, ""]}
                    contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", fontSize: 13 }}
                  />
                  <Bar dataKey="count" fill="#c9915f" radius={[4, 4, 0, 0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
            <h3 className="mb-4 text-sm font-semibold text-[var(--text-h-light)]">Produtos mais vendidos</h3>
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-[var(--text-on-light)] opacity-60">Sem vendas suficientes nesse período.</p>
            ) : (
              <ul className="divide-y divide-black/5">
                {data.topProducts.map((product, index) => (
                  <li key={product.productId} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--gold)]/15 text-xs font-bold text-[var(--gold-deep)]">
                        {index + 1}
                      </span>
                      <p className="text-sm font-medium text-[var(--text-h-light)]">{product.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--text-h-light)]">{product.quantity} un.</p>
                      <p className="text-xs text-[var(--text-on-light)] opacity-60">{formatCurrency(product.revenueCents)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}