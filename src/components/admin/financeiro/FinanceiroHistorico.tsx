"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/expenseCategories";

type ChartPoint = { label: string; entradas: number; saidas: number };
type Transaction = {
  id: string;
  type: "entrada" | "saida";
  description: string;
  amountCents: number;
  date: string;
  category: string | null;
};
type Preset = "1m" | "6m" | "1a" | "custom";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
function formatCurrencyShort(cents: number) {
  const value = cents / 100;
  return Math.abs(value) >= 1000 ? `R$ ${(value / 1000).toFixed(1)}k` : `R$ ${value.toFixed(0)}`;
}
function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

type FinanceiroHistoricoProps = {
  refreshKey?: number;
};

export function FinanceiroHistorico({ refreshKey = 0 }: FinanceiroHistoricoProps) {
  const today = useMemo(() => new Date(), []);

  const [preset, setPreset] = useState<Preset>("1m");
  const [from, setFrom] = useState(() => {
    const d = new Date(today);
    d.setMonth(d.getMonth() - 1);
    return isoDate(d);
  });
  const [to, setTo] = useState(() => isoDate(today));
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);

  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  function applyPreset(p: Exclude<Preset, "custom">) {
    const end = new Date();
    const start = new Date();
    if (p === "1m") start.setMonth(start.getMonth() - 1);
    if (p === "6m") start.setMonth(start.getMonth() - 6);
    if (p === "1a") start.setFullYear(start.getFullYear() - 1);

    setPreset(p);
    setFrom(isoDate(start));
    setTo(isoDate(end));
    setCustomFrom(isoDate(start));
    setCustomTo(isoDate(end));
  }

  function applyCustomRange() {
    setPreset("custom");
    setFrom(customFrom);
    setTo(customTo);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/financeiro/historico?from=${from}&to=${to}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setChartData(data.chartData ?? []);
        setTransactions(data.transactions ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [from, to, refreshKey]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-[var(--text-h-light)]">
          Histórico financeiro
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { key: "1m", label: "1 mês" },
              { key: "6m", label: "6 meses" },
              { key: "1a", label: "1 ano" },
            ] as const
          ).map((p) => (
            <button
              key={p.key}
              onClick={() => applyPreset(p.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                preset === p.key
                  ? "bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] text-[#1c1006]"
                  : "bg-[var(--paper-soft)] text-[var(--text-on-light)] hover:bg-black/5"
              }`}
            >
              {p.label}
            </button>
          ))}

          <div className="flex items-center gap-1.5 rounded-full bg-[var(--paper-soft)] px-2 py-1">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-[124px] bg-transparent text-xs text-[var(--text-on-light)] outline-none"
            />
            <span className="text-xs text-[var(--text-on-light)] opacity-50">→</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-[124px] bg-transparent text-xs text-[var(--text-on-light)] outline-none"
            />
            <button
              onClick={applyCustomRange}
              className="ml-1 rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-semibold text-[#f6efe4] hover:opacity-90"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
        {loading ? (
          <div className="flex h-[280px] animate-pulse items-center justify-center rounded-xl bg-black/5 text-sm text-[var(--text-on-light)] opacity-50">
            Carregando gráfico...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-[var(--text-on-light)] opacity-60">
            Sem movimentações nesse período.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            {/* key força o gráfico a "renascer" a cada troca de período OU novo dado, tocando a animação de novo */}
            <BarChart key={`${from}-${to}-${refreshKey}`} data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#3a2f24" }} axisLine={{ stroke: "rgba(0,0,0,0.1)" }} tickLine={false} />
              <YAxis
                tickFormatter={formatCurrencyShort}
                tick={{ fontSize: 12, fill: "#3a2f24" }}
                axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
                tickLine={false}
                width={64}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value ?? 0))}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.08)",
                  fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />

              <Bar
                dataKey="entradas"
                name="Entradas"
                fill="#e8a86b"
                radius={[6, 6, 0, 0]}
                animationDuration={900}
                animationEasing="ease-out"
              />
              <Bar
                dataKey="saidas"
                name="Saídas"
                fill="#f87171"
                radius={[6, 6, 0, 0]}
                animationDuration={900}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
        {loading ? (
          <div className="animate-pulse divide-y divide-black/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div className="space-y-2">
                  <div className="h-3.5 w-44 rounded bg-black/10" />
                  <div className="h-2.5 w-24 rounded bg-black/5" />
                </div>
                <div className="h-3.5 w-16 rounded bg-black/10" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="p-6 text-sm text-[var(--text-on-light)] opacity-60">
            Nenhuma movimentação nesse período.
          </p>
        ) : (
          <ul className="max-h-[420px] divide-y divide-black/5 overflow-y-auto">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      t.type === "entrada"
                        ? "bg-[var(--success)]/15 text-[var(--success)]"
                        : "bg-[var(--danger)]/15 text-[var(--danger)]"
                    }`}
                  >
                    {t.type === "entrada" ? "↑" : "↓"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-h-light)]">{t.description}</p>
                    <p className="text-xs text-[var(--text-on-light)] opacity-60">
                      {new Date(t.date).toLocaleDateString("pt-BR")}
                      {t.category ? ` · ${EXPENSE_CATEGORY_LABELS[t.category] ?? t.category}` : ""}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    t.type === "entrada" ? "text-[var(--success)]" : "text-[var(--danger)]"
                  }`}
                >
                  {t.type === "entrada" ? "+" : "−"} {formatCurrency(t.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}