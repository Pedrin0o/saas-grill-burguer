"use client";

import { useMemo, useState } from "react";
import { StatCard } from "@/components/admin/StatCard";
import { EXPENSE_CATEGORY_LABELS, EXPENSE_CATEGORY_OPTIONS } from "@/lib/expenseCategories";

type Expense = {
  id: string;
  description: string;
  amountCents: number;
  category: string;
  paid: boolean;
  expenseDate: string;
};

type FinanceiroClientProps = {
  initialExpenses: Expense[];
  revenueThisMonth: number;
  onDataChange?: () => void; // dispara pra avisar os outros gráficos que precisam recarregar
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function isSameMonth(dateIso: string, ref: Date) {
  const d = new Date(dateIso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

export function FinanceiroClient({ initialExpenses, revenueThisMonth, onDataChange }: FinanceiroClientProps) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORY_OPTIONS[0]);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [paid, setPaid] = useState(true);

  const { totalExpensesThisMonth, netResult } = useMemo(() => {
    const now = new Date();
    const total = expenses
      .filter((e) => isSameMonth(e.expenseDate, now))
      .reduce((sum, e) => sum + e.amountCents, 0);
    return { totalExpensesThisMonth: total, netResult: revenueThisMonth - total };
  }, [expenses, revenueThisMonth]);

  function resetForm() {
    setDescription("");
    setAmount("");
    setCategory(EXPENSE_CATEGORY_OPTIONS[0]);
    setExpenseDate(new Date().toISOString().slice(0, 10));
    setPaid(true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const amountCents = Math.round(parseFloat(amount.replace(",", ".")) * 100);
    if (!description.trim() || isNaN(amountCents)) {
      setError("Preencha a descrição e um valor válido.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/despesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amountCents, category, paid, expenseDate }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Erro ao salvar despesa.");
      }

      const created = await res.json();
      setExpenses((prev) =>
        [
          {
            id: created.id,
            description: created.description,
            amountCents: created.amountCents,
            category: created.category,
            paid: created.paid,
            expenseDate: created.expenseDate,
          },
          ...prev,
        ].sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())
      );

      resetForm();
      setShowForm(false);
      onDataChange?.(); // avisa a tela pra recarregar os outros gráficos
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePaid(expense: Expense) {
    const res = await fetch(`/api/despesas/${expense.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid: !expense.paid }),
    });
    if (!res.ok) return;
    setExpenses((prev) => prev.map((e) => (e.id === expense.id ? { ...e, paid: !e.paid } : e)));
    onDataChange?.();
  }

  async function handleDelete(expense: Expense) {
    if (!confirm(`Apagar a despesa "${expense.description}"? Não dá pra desfazer.`)) return;
    const res = await fetch(`/api/despesas/${expense.id}`, { method: "DELETE" });
    if (!res.ok) return;
    setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
    onDataChange?.();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-h-light)]">Financeiro</h1>
          <p className="mt-1 text-sm text-[var(--text-on-light)] opacity-70">
            Receita, despesas e resultado do mês.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] px-5 py-2.5 text-sm font-semibold text-[#1c1006] transition-transform hover:-translate-y-0.5"
        >
          {showForm ? "Cancelar" : "+ Nova despesa"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Receita do mês" value={formatCurrency(revenueThisMonth)} hint="pedidos aprovados" />
        <StatCard label="Despesas do mês" value={formatCurrency(totalExpensesThisMonth)} hint="todas as categorias" />
        <StatCard
          label="Resultado líquido"
          value={formatCurrency(netResult)}
          hint={netResult >= 0 ? "positivo" : "negativo"}
        />
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-6 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)] sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">Descrição</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
              placeholder="Compra de carne no fornecedor X"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">Valor (R$)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
              placeholder="150,00"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
            >
              {EXPENSE_CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {EXPENSE_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">Data</label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="paid"
              checked={paid}
              onChange={(e) => setPaid(e.target.checked)}
              className="h-4 w-4 accent-[var(--gold-deep)]"
            />
            <label htmlFor="paid" className="text-sm text-[var(--text-on-light)]">Já foi paga</label>
          </div>
          {error && <p className="sm:col-span-2 text-sm text-[var(--danger)]">{error}</p>}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] px-5 py-2.5 text-sm font-semibold text-[#1c1006] disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar despesa"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
        {expenses.length === 0 ? (
          <p className="p-6 text-sm text-[var(--text-on-light)] opacity-60">Nenhuma despesa registrada ainda.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-[var(--text-on-light)] opacity-60">
                <th className="px-6 py-3">Descrição</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Valor</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-black/5 last:border-0">
                  <td className="px-6 py-3 font-medium text-[var(--text-h-light)]">{expense.description}</td>
                  <td className="px-6 py-3 text-[var(--text-on-light)]">
                    {EXPENSE_CATEGORY_LABELS[expense.category] ?? expense.category}
                  </td>
                  <td className="px-6 py-3 text-[var(--text-on-light)]">
                    {new Date(expense.expenseDate).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-3 font-medium text-[var(--text-h-light)]">
                    {formatCurrency(expense.amountCents)}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => togglePaid(expense)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        expense.paid
                          ? "bg-[var(--success)]/15 text-[var(--success)]"
                          : "bg-[var(--danger)]/15 text-[var(--danger)]"
                      }`}
                    >
                      {expense.paid ? "Paga" : "Pendente"}
                    </button>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDelete(expense)}
                      className="text-xs font-medium text-[var(--danger)] hover:underline"
                    >
                      Apagar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}