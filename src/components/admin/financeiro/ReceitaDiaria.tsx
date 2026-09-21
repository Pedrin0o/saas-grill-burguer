"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type Period = "hoje" | "7d" | "15d";
type Point = { label: string; receita: number };

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
function formatCurrencyShort(cents: number) {
  const value = cents / 100;
  return Math.abs(value) >= 1000 ? `R$ ${(value / 1000).toFixed(1)}k` : `R$ ${value.toFixed(0)}`;
}

const PERIOD_LABELS: Record<Period, string> = { hoje: "Hoje", "7d": "7 dias", "15d": "15 dias" };

type ReceitaDiariaProps = {
  refreshKey?: number; // muda toda vez que uma despesa/pedido é alterado, forçando recarregar
};

export function ReceitaDiaria({ refreshKey = 0 }: ReceitaDiariaProps) {
  const [period, setPeriod] = useState<Period>("hoje");
  const [data, setData] = useState<Point[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/financeiro/receita-diaria?period=${period}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        setData(json.data ?? []);
        setTotal(json.total ?? 0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period, refreshKey]);

  const isEmpty = !loading && data.every((d) => d.receita === 0);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-h-light)]">Receita diária</h3>
          <p className="mt-1 text-xl font-semibold text-[var(--text-h-light)]">
            {loading ? "..." : formatCurrency(total)}
          </p>
          <p className="text-xs text-[var(--text-on-light)] opacity-60">{PERIOD_LABELS[period]}</p>
        </div>
        <div className="flex gap-1.5">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                period === p
                  ? "bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] text-[#1c1006]"
                  : "bg-[var(--paper-soft)] text-[var(--text-on-light)] hover:bg-black/5"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-[200px] animate-pulse items-center justify-center rounded-xl bg-black/5 text-sm text-[var(--text-on-light)] opacity-50">
          Carregando...
        </div>
      ) : isEmpty ? (
        <div className="flex h-[200px] items-center justify-center text-sm text-[var(--text-on-light)] opacity-60">
          Sem receita nesse período.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart key={`${period}-${refreshKey}`} data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#3a2f24" }} axisLine={{ stroke: "rgba(0,0,0,0.1)" }} tickLine={false} />
            <YAxis tickFormatter={formatCurrencyShort} tick={{ fontSize: 11, fill: "#3a2f24" }} axisLine={false} tickLine={false} width={56} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value ?? 0))}
              contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", fontSize: 13 }}
            />
            <Line
              type="monotone"
              dataKey="receita"
              stroke="#e8a86b"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#e8a86b", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}