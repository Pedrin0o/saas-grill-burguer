"use client";

import { useState } from "react";
import { SugestoesReposicao } from "./SugestoesReposicao";

type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: "UN" | "G" | "ML";
  costCents: number;
  active: boolean;
};

type EstoqueClientProps = {
  initialIngredients: Ingredient[];
};

const LOW_STOCK_THRESHOLD = 5;
  
function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function unitLabel(unit: Ingredient["unit"]) {
  if (unit === "G") return "g";
  if (unit === "ML") return "ml";
  return "un";
}

function formatQuantity(quantity: number, unit: Ingredient["unit"]) {
  if (unit === "G") return `${quantity} g`;
  if (unit === "ML") return `${quantity} ml`;

  return `${quantity} un`;
}

function statusFor(quantity: number) {
  if (quantity <= 0) {
    return {
      label: "Esgotado",
      className: "bg-[var(--danger)]/15 text-[var(--danger)]",
    };
  }

  if (quantity <= LOW_STOCK_THRESHOLD) {
    return {
      label: "Estoque baixo",
      className: "bg-[var(--gold)]/20 text-[var(--gold-deep)]",
    };
  }

  return {
    label: "OK",
    className: "bg-[var(--success)]/15 text-[var(--success)]",
  };
}

export function EstoqueClient({
  initialIngredients,
}: EstoqueClientProps) {
  const [ingredients, setIngredients] = useState(initialIngredients);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [savingId, setSavingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<Ingredient["unit"]>("UN");
  const [costPerUnit, setCostPerUnit] = useState("");

    const [drafts, setDrafts] = useState<Record<string, string>>({});

  const [restockDraft, setRestockDraft] = useState<{
    ingredientId: string;
    ingredientName: string;
    addedQty: number;
    unit: Ingredient["unit"];
    amountCents: number;
  } | null>(null);
  const [restockPaid, setRestockPaid] = useState(true);
  const [savingRestockExpense, setSavingRestockExpense] = useState(false);

  function resetForm() {
    setName("");
    setQuantity("");
    setUnit("UN");
    setCostPerUnit("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedQuantity = parseInt(quantity, 10);

    if (!name.trim()) {
      setError("Informe o nome do ingrediente.");
      return;
    }

    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      setError("Informe uma quantidade válida.");
      return;
    }

    setSaving(true);

    try {
      const parsedCost = costPerUnit
        ? Math.round(parseFloat(costPerUnit.replace(",", ".")) * 100)
        : 0;

      const res = await fetch("/api/ingredientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          quantity: parsedQuantity,
          unit,
          costCents: isNaN(parsedCost) ? 0 : parsedCost,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(
          body.error ?? "Erro ao cadastrar ingrediente."
        );
      }

      const created = await res.json();

      setIngredients((prev) =>
        [...prev, created].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro inesperado."
      );
    } finally {
      setSaving(false);
    }
  }

  async function adjustStock(
    id: string,
    newQuantity: number
  ) {
    const safeQuantity = Math.max(0, newQuantity);

    setSavingId(id);

    try {
      const res = await fetch(`/api/ingredientes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: safeQuantity,
        }),
      });

      if (!res.ok) return;

      const updated = await res.json();

      setIngredients((prev) =>
        prev.map((ingredient) =>
          ingredient.id === id
            ? {
                ...ingredient,
                quantity: updated.quantity,
              }
            : ingredient
        )
      );
    } finally {
      setSavingId(null);
    }
  }

  function handleSaveDraft(id: string) {
    const raw = drafts[id];

    const parsed = parseInt(raw, 10);

    if (isNaN(parsed)) return;

    const ingredient = ingredients.find((item) => item.id === id);
    const previousQty = ingredient?.quantity ?? 0;

    adjustStock(id, parsed);

    setDrafts((prev) => {
      const next = { ...prev };

      delete next[id];

      return next;
    });

    // se a quantidade aumentou (reabastecimento) e o ingrediente tem custo
    // cadastrado, sugere lançar a despesa de compra automaticamente
    if (ingredient && parsed > previousQty && ingredient.costCents > 0) {
      const addedQty = parsed - previousQty;
      setRestockDraft({
        ingredientId: id,
        ingredientName: ingredient.name,
        addedQty,
        unit: ingredient.unit,
        amountCents: addedQty * ingredient.costCents,
      });
      setRestockPaid(true);
    }
  }

  async function handleDelete(id: string) {
    const ingredient = ingredients.find(
      (item) => item.id === id
    );

    if (!ingredient) return;

    if (
      !confirm(
        `Apagar "${ingredient.name}"? Não dá para desfazer.`
      )
    ) {
      return;
    }

    const res = await fetch(`/api/ingredientes/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setError("Não foi possível apagar o ingrediente.");
      return;
    }

    setIngredients((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  async function confirmRestockExpense() {
    if (!restockDraft) return;
    setSavingRestockExpense(true);

    try {
      await fetch("/api/despesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: `Reposição de estoque — ${restockDraft.addedQty}${unitLabel(restockDraft.unit)} de ${restockDraft.ingredientName}`,
          amountCents: restockDraft.amountCents,
          category: "FORNECEDORES",
          paid: restockPaid,
          expenseDate: new Date().toISOString().slice(0, 10),
        }),
      });
    } finally {
      setSavingRestockExpense(false);
      setRestockDraft(null);
    }
  }

  const outOfStockCount = ingredients.filter(
    (ingredient) => ingredient.quantity <= 0
  ).length;

  const lowStockCount = ingredients.filter(
    (ingredient) =>
      ingredient.quantity > 0 &&
      ingredient.quantity <= LOW_STOCK_THRESHOLD
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-h-light)]">
            Estoque
          </h1>

          <p className="mt-1 text-sm text-[var(--text-on-light)] opacity-70">
            Ingredientes e itens utilizados na produção dos
            produtos.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm((value) => !value);
            setError(null);
          }}
          className="rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] px-5 py-2.5 text-sm font-semibold text-[#1c1006] transition-transform hover:-translate-y-0.5"
        >
          {showForm ? "Cancelar" : "+ Novo ingrediente"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-6 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)] sm:grid-cols-3"
        >
          <div className="sm:col-span-3">
            <h2 className="text-lg font-semibold text-[var(--text-h-light)]">
              Novo ingrediente
            </h2>

            <p className="mt-1 text-sm text-[var(--text-on-light)] opacity-60">
              Cadastre um item que será utilizado na composição
              dos produtos.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">
              Nome
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
              placeholder="Carne 180g"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">
              Quantidade inicial
            </label>

            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              type="number"
              min={0}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
              placeholder="20"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">
              Unidade
            </label>

            <select
              value={unit}
              onChange={(e) =>
                setUnit(
                  e.target.value as Ingredient["unit"]
                )
              }
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
            >
              <option value="UN">
                Unidade
              </option>

              <option value="G">
                Gramas
              </option>

              <option value="ML">
                Mililitros
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">
              Custo por unidade (R$) — opcional
            </label>

            <input
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
              placeholder="0,05"
            />
            <p className="mt-1 text-[11px] text-[var(--text-on-light)] opacity-50">
              Usado pra calcular margem de lucro e sugerir despesas ao reabastecer.
            </p>
          </div>

          {error && (
            <p className="sm:col-span-3 text-sm text-[var(--danger)]">
              {error}
            </p>
          )}

          <div className="flex gap-2 sm:col-span-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] px-5 py-2.5 text-sm font-semibold text-[#1c1006] disabled:opacity-60"
            >
              {saving
                ? "Cadastrando..."
                : "Cadastrar ingrediente"}
            </button>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="rounded-full bg-[var(--paper-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--text-h-light)]"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {(outOfStockCount > 0 || lowStockCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {outOfStockCount > 0 && (
            <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-2 text-sm font-medium text-[var(--danger)]">
              {outOfStockCount}{" "}
              {outOfStockCount === 1
                ? "item esgotado"
                : "itens esgotados"}
            </div>
          )}

          {lowStockCount > 0 && (
            <div className="rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-4 py-2 text-sm font-medium text-[var(--gold-deep)]">
              {lowStockCount}{" "}
              {lowStockCount === 1
                ? "item com estoque baixo"
                : "itens com estoque baixo"}
            </div>
          )}
        </div>
      )}

      <SugestoesReposicao />

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
        {ingredients.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-[var(--text-on-light)] opacity-60">
              Nenhum ingrediente cadastrado ainda.
            </p>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-sm font-medium text-[var(--gold-deep)] hover:underline"
              >
                + Cadastrar primeiro ingrediente
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-[var(--text-on-light)] opacity-60">
                <th className="px-6 py-3">
                  Ingrediente
                </th>

                <th className="px-6 py-3">
                  Quantidade
                </th>

                <th className="px-6 py-3">
                  Status
                </th>

                <th className="px-6 py-3">
                  Custo/unid.
                </th>

                <th className="px-6 py-3">
                  Definir quantidade
                </th>

                <th className="px-6 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {ingredients.map((ingredient) => {
                const status = statusFor(
                  ingredient.quantity
                );

                const draft =
                  drafts[ingredient.id];

                const isSaving =
                  savingId === ingredient.id;

                return (
                  <tr
                    key={ingredient.id}
                    className="border-b border-black/5 last:border-0"
                  >
                    <td className="px-6 py-3">
                      <p className="font-medium text-[var(--text-h-light)]">
                        {ingredient.name}
                      </p>

                      <p className="text-xs text-[var(--text-on-light)] opacity-50">
                        {ingredient.unit === "UN"
                          ? "Unidade"
                          : ingredient.unit === "G"
                          ? "Gramas"
                          : "Mililitros"}
                      </p>
                    </td>

                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            adjustStock(
                              ingredient.id,
                              ingredient.quantity - 1
                            )
                          }
                          disabled={
                            isSaving ||
                            ingredient.quantity <= 0
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-[var(--text-on-light)] transition-colors hover:bg-black/5 disabled:opacity-30"
                          aria-label="Diminuir 1"
                        >
                          −
                        </button>

                        <span className="min-w-20 text-center font-semibold text-[var(--text-h-light)]">
                          {formatQuantity(
                            ingredient.quantity,
                            ingredient.unit
                          )}
                        </span>

                        <button
                          onClick={() =>
                            adjustStock(
                              ingredient.id,
                              ingredient.quantity + 1
                            )
                          }
                          disabled={isSaving}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-[var(--text-on-light)] transition-colors hover:bg-black/5 disabled:opacity-30"
                          aria-label="Aumentar 1"
                        >
                          +
                        </button>
                      </div>
                    </td>

                     <td className="px-6 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td className="px-6 py-3 text-[var(--text-on-light)]">
                      {ingredient.costCents > 0
                        ? `${formatCurrency(ingredient.costCents)}/${unitLabel(ingredient.unit)}`
                        : "—"}
                    </td>

                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          placeholder="ex: 20"
                          value={draft ?? ""}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [ingredient.id]:
                                e.target.value,
                            }))
                          }
                          className="w-24 rounded-lg border border-black/10 px-2 py-1.5 text-sm outline-none focus:border-[var(--gold-deep)]"
                        />

                        <button
                          onClick={() =>
                            handleSaveDraft(
                              ingredient.id
                            )
                          }
                          disabled={
                            !draft || isSaving
                          }
                          className="rounded-full bg-[var(--paper-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--text-h-light)] transition-colors hover:bg-black/10 disabled:opacity-40"
                        >
                          Salvar
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() =>
                          handleDelete(ingredient.id)
                        }
                        className="text-xs font-medium text-[var(--danger)] hover:underline"
                      >
                        Apagar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    {restockDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-[var(--text-h-light)]">
                Lançar despesa de reposição?
              </h2>
              <p className="mt-1 text-sm text-[var(--text-on-light)] opacity-60">
                Você repôs {restockDraft.addedQty}{unitLabel(restockDraft.unit)} de{" "}
                {restockDraft.ingredientName}. Já deixamos a despesa pronta em Fornecedores.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg bg-[var(--paper-soft)] px-4 py-3">
                <p className="text-xs text-[var(--text-on-light)] opacity-60">Valor estimado</p>
                <p className="text-lg font-semibold text-[var(--text-h-light)]">
                  {formatCurrency(restockDraft.amountCents)}
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm text-[var(--text-on-light)]">
                <input
                  type="checkbox"
                  checked={restockPaid}
                  onChange={(e) => setRestockPaid(e.target.checked)}
                  className="h-4 w-4 accent-[var(--gold-deep)]"
                />
                Já foi paga
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRestockDraft(null)}
                className="rounded-full bg-[var(--paper-soft)] px-4 py-2 text-sm font-semibold text-[var(--text-h-light)]"
              >
                Ignorar
              </button>
              <button
                type="button"
                onClick={confirmRestockExpense}
                disabled={savingRestockExpense}
                className="rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] px-4 py-2 text-sm font-semibold text-[#1c1006] disabled:opacity-60"
              >
                {savingRestockExpense ? "Lançando..." : "Lançar despesa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}