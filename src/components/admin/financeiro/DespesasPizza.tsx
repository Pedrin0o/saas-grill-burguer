"use client";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from "recharts";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/expenseCategories";

type Slice = { category: string; totalCents: number };

const COLORS = ["#e8a86b", "#f87171", "#c9915f", "#f0c987", "#a97452", "#d9b48f", "#8a6d4f", "#b08968"];

const PieAny = Pie as unknown as React.ComponentType<any>;

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function renderActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={12} fontWeight={600} fill="#3a2f24">
        {EXPENSE_CATEGORY_LABELS[payload.category] ?? payload.category}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={11} fill="#3a2f24" opacity={0.7}>
        {formatCurrency(value)} · {(percent * 100).toFixed(0)}%
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(0 6px 10px rgba(28,16,6,0.35))" }}
      />
    </g>
  );
}

type DespesasPizzaProps = {
  refreshKey?: number;
};

export function DespesasPizza({ refreshKey = 0 }: DespesasPizzaProps) {
  const [slices, setSlices] = useState<Slice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/financeiro/categorias")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setSlices(json.data ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
      <h3 className="mb-1 text-sm font-semibold text-[var(--text-h-light)]">Despesas por categoria</h3>
      <p className="mb-3 text-xs text-[var(--text-on-light)] opacity-60">este mês</p>

      {loading ? (
        <div className="flex h-[220px] animate-pulse items-center justify-center rounded-xl bg-black/5 text-sm text-[var(--text-on-light)] opacity-50">
          Carregando...
        </div>
      ) : slices.length === 0 ? (
        <div className="flex h-[220px] items-center justify-center text-sm text-[var(--text-on-light)] opacity-60">
          Nenhuma despesa registrada neste mês.
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
              <PieAny
                data={slices}
                dataKey="totalCents"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_: unknown, index: number) => setActiveIndex(index)}
                animationDuration={800}
              >
                {slices.map((s, i) => (
                  <Cell key={s.category} fill={COLORS[i % COLORS.length]} />
                ))}
              </PieAny>
            </PieChart>
          </ResponsiveContainer>

          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {slices.map((s, i) => (
              <li key={s.category} className="flex items-center gap-1.5 text-xs text-[var(--text-on-light)]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {EXPENSE_CATEGORY_LABELS[s.category] ?? s.category}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}