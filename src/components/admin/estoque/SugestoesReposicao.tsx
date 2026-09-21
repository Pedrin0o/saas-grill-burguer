"use client";

import { useEffect, useState } from "react";

type Suggestion = {
  id: string;
  name: string;
  unit: "UN" | "G" | "ML";
  currentQty: number;
  avgDaily: number;
  daysLeft: number | null;
  suggestedQty: number;
};

type Period = 7 | 15 | 30;

function formatQty(qty: number, unit: Suggestion["unit"]) {
  if (unit === "G") return `${qty} g`;
  if (unit === "ML") return `${qty} ml`;
  return `${qty} un`;
}

export function SugestoesReposicao() {
  const [period, setPeriod] = useState<Period>(30);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/estoque/sugestoes?days=${period}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setSuggestions(json.suggestions ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-h-light)]">Sugestão de reposição</h3>
          <p className="text-xs text-[var(--text-on-light)] opacity-60">
            Baseado no consumo médio dos últimos {period} dias
          </p>
        </div>
        <div className="flex gap-1.5">
          {([7, 15, 30] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
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

      {loading ? (
        <div className="flex h-24 animate-pulse items-center justify-center rounded-xl bg-black/5 text-sm text-[var(--text-on-light)] opacity-50">
          Calculando...
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-sm text-[var(--text-on-light)] opacity-60">
          Nenhum ingrediente correndo risco de acabar nos próximos 7 dias, no ritmo atual de consumo.
        </p>
      ) : (
        <ul className="divide-y divide-black/5">
          {suggestions.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-[var(--text-h-light)]">{s.name}</p>
                <p className="text-xs text-[var(--text-on-light)] opacity-60">
                  {formatQty(s.currentQty, s.unit)} em estoque · consumo médio {formatQty(s.avgDaily, s.unit)}/dia
                  {s.daysLeft !== null && ` · acaba em ~${s.daysLeft} dias`}
                </p>
              </div>
              {s.suggestedQty > 0 && (
                <span className="rounded-full bg-[var(--gold)]/15 px-3 py-1 text-xs font-semibold text-[var(--gold-deep)]">
                  Repor {formatQty(s.suggestedQty, s.unit)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}