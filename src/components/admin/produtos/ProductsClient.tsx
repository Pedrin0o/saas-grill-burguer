"use client";

import { useState } from "react";

type IngredientUnit = "UN" | "G" | "ML";

type IngredientOption = {
  id: string;
  name: string;
  unit: IngredientUnit;
};

type ProductIngredient = {
  id: string;
  name: string;
  quantity: number;
  unit: IngredientUnit;
  costCents: number;
};

type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stockQty: number;
  active: boolean;
  categoryName: string;
  ingredients: ProductIngredient[];
  estimatedCostCents: number | null;
};

type ProductsClientProps = {
  initialProducts: Product[];
  categoryNames: string[];
  initialIngredients: IngredientOption[];
};

type CompositionItem = {
  ingredientId: string;
  quantity: string;
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function formatUnit(unit: IngredientUnit) {
  if (unit === "G") return "g";
  if (unit === "ML") return "ml";
  return "un";
}

function marginInfo(product: Product) {
  if (product.estimatedCostCents === null) return null;

  const profitCents = product.priceCents - product.estimatedCostCents;
  const marginPercent =
    product.priceCents > 0 ? (profitCents / product.priceCents) * 100 : 0;

  return { costCents: product.estimatedCostCents, profitCents, marginPercent };
}

export function ProductsClient({
  initialProducts,
  categoryNames,
  initialIngredients,
}: ProductsClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [ingredients, setIngredients] =
    useState<IngredientOption[]>(initialIngredients);

  const [showForm, setShowForm] = useState(false);
  const [showIngredientModal, setShowIngredientModal] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [savingIngredient, setSavingIngredient] =
    useState(false);

  const [error, setError] = useState<string | null>(null);
  const [ingredientError, setIngredientError] =
    useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryName, setCategoryName] = useState(
    categoryNames[0] ?? ""
  );

  const [composition, setComposition] = useState<
    CompositionItem[]
  >([]);

  const [newIngredientName, setNewIngredientName] =
    useState("");
  const [newIngredientQuantity, setNewIngredientQuantity] =
    useState("");
  const [newIngredientUnit, setNewIngredientUnit] =
    useState<IngredientUnit>("UN");
  const [newIngredientCost, setNewIngredientCost] =
    useState("");

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setCategoryName(categoryNames[0] ?? "");
    setComposition([]);
    setError(null);
  }

  function resetIngredientModal() {
    setNewIngredientName("");
    setNewIngredientQuantity("");
    setNewIngredientUnit("UN");
    setNewIngredientCost("");
    setIngredientError(null);
  }

  function addCompositionIngredient() {
    setComposition((prev) => [
      ...prev,
      {
        ingredientId: "",
        quantity: "1",
      },
    ]);
  }

  function updateCompositionIngredient(
    index: number,
    field: keyof CompositionItem,
    value: string
  ) {
    setComposition((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function removeCompositionIngredient(index: number) {
    setComposition((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function getIngredientOption(id: string) {
    return ingredients.find(
      (ingredient) => ingredient.id === id
    );
  }

  async function handleQuickIngredientSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();
    setIngredientError(null);

    const quantity = Number(newIngredientQuantity);

    if (!newIngredientName.trim()) {
      setIngredientError(
        "Informe o nome do ingrediente."
      );
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setIngredientError(
        "Informe uma quantidade inicial válida."
      );
      return;
    }

    setSavingIngredient(true);

    try {
      const parsedCost = newIngredientCost
        ? Math.round(parseFloat(newIngredientCost.replace(",", ".")) * 100)
        : 0;

      const res = await fetch("/api/ingredientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newIngredientName.trim(),
          quantity,
          unit: newIngredientUnit,
          costCents: isNaN(parsedCost) ? 0 : parsedCost,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(
          body.error ?? "Erro ao cadastrar ingrediente."
        );
      }

      const createdIngredient: IngredientOption = {
        id: body.id,
        name: body.name,
        unit: body.unit,
      };

      setIngredients((prev) =>
        [...prev, createdIngredient].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      setComposition((prev) => [
        ...prev,
        {
          ingredientId: createdIngredient.id,
          quantity: "1",
        },
      ]);

      resetIngredientModal();
      setShowIngredientModal(false);
    } catch (err) {
      setIngredientError(
        err instanceof Error
          ? err.message
          : "Erro inesperado."
      );
    } finally {
      setSavingIngredient(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const priceCents = Math.round(
      parseFloat(price.replace(",", ".")) * 100
    );

    if (
      !name.trim() ||
      !categoryName.trim() ||
      isNaN(priceCents)
    ) {
      setError(
        "Preencha nome, categoria e um preço válido."
      );
      return;
    }

    const validComposition = composition.filter(
      (item) => item.ingredientId
    );

    const duplicatedIngredients =
      validComposition.some(
        (item, index) =>
          validComposition.findIndex(
            (other) =>
              other.ingredientId === item.ingredientId
          ) !== index
      );

    if (duplicatedIngredients) {
      setError(
        "Não adicione o mesmo ingrediente mais de uma vez."
      );
      return;
    }

    const parsedComposition = validComposition.map(
      (item) => ({
        ingredientId: item.ingredientId,
        quantity: Number(item.quantity),
      })
    );

    const invalidQuantity = parsedComposition.some(
      (item) =>
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
    );

    if (invalidQuantity) {
      setError(
        "Todos os ingredientes precisam ter uma quantidade maior que zero."
      );
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          priceCents,
          stockQty: 0,
          categoryName,
          ingredients: parsedComposition,
        }),
      });

      if (!res.ok) {
        const body = await res.json();

        throw new Error(
          body.error ?? "Erro ao salvar produto."
        );
      }

      const created = await res.json();

      setProducts((prev) =>
        [
          ...prev,
          {
            id: created.id,
            name: created.name,
            description: created.description,
            priceCents: created.priceCents,
            stockQty: created.stockQty,
            active: created.active,
             categoryName: created.category.name,
            ingredients:
              created.ingredients.map(
                (item: {
                  ingredient: IngredientOption & { costCents?: number };
                  quantity: number;
                }) => ({
                  id: item.ingredient.id,
                  name: item.ingredient.name,
                  quantity: item.quantity,
                  unit: item.ingredient.unit,
                  costCents: item.ingredient.costCents ?? 0,
                })
              ),
            // recalculado certinho no próximo carregamento da página;
            // por ora não mostramos margem pra não arriscar número errado
            estimatedCostCents: null,
          },
        ].sort((a, b) =>
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

  async function toggleActive(product: Product) {
    const res = await fetch(
      `/api/produtos/${product.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !product.active,
        }),
      }
    );

    if (!res.ok) return;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              active: !product.active,
            }
          : p
      )
    );
  }

  async function handleDelete(product: Product) {
    if (
      !confirm(
        `Apagar "${product.name}"? Não dá pra desfazer.`
      )
    ) {
      return;
    }

    const res = await fetch(
      `/api/produtos/${product.id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) return;

    setProducts((prev) =>
      prev.filter((p) => p.id !== product.id)
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-h-light)]">
            Cardápio
          </h1>

          <p className="mt-1 text-sm text-[var(--text-on-light)] opacity-70">
            Produtos que aparecem no cardápio digital.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm((value) => !value);
            setError(null);
          }}
          className="rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] px-5 py-2.5 text-sm font-semibold text-[#1c1006] transition-transform hover:-translate-y-0.5"
        >
          {showForm
            ? "Cancelar"
            : "+ Novo produto"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-6 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]"
        >
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-h-light)]">
              Novo produto
            </h2>

            <p className="mt-1 text-sm text-[var(--text-on-light)] opacity-60">
              Cadastre o produto e defina exatamente quais
              ingredientes fazem parte dele.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">
                Nome
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
                placeholder="X-Bacon"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">
                Categoria
              </label>

              <input
                value={categoryName}
                onChange={(e) =>
                  setCategoryName(e.target.value)
                }
                list="category-suggestions"
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
                placeholder="Burgers"
              />

              <datalist id="category-suggestions">
                {categoryNames.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">
                Descrição
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={2}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
                placeholder="Pão brioche, smash burger, cheddar, bacon e molho da casa."
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">
                Preço (R$)
              </label>

              <input
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
                placeholder="29,90"
              />
            </div>
          </div>

          <div className="rounded-xl border border-black/10 bg-[var(--paper-soft)] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-[var(--text-h-light)]">
                  Composição do produto
                </h3>

                <p className="mt-1 text-xs text-[var(--text-on-light)] opacity-60">
                  Defina os ingredientes e a quantidade
                  utilizada para preparar uma unidade.
                </p>
              </div>

              <button
                type="button"
                onClick={addCompositionIngredient}
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[var(--text-h-light)] shadow-sm transition-colors hover:bg-black/5"
              >
                + Adicionar ingrediente
              </button>
            </div>

            {composition.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-black/10 bg-white p-4 text-center">
                <p className="text-sm text-[var(--text-on-light)] opacity-60">
                  Nenhum ingrediente adicionado.
                </p>

                <button
                  type="button"
                  onClick={addCompositionIngredient}
                  className="mt-2 text-xs font-semibold text-[var(--gold-deep)] hover:underline"
                >
                  Adicionar primeiro ingrediente
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {composition.map((item, index) => {
                  const selected =
                    getIngredientOption(
                      item.ingredientId
                    );

                  return (
                    <div
                      key={`${index}-${item.ingredientId}`}
                      className="flex flex-col gap-2 rounded-lg bg-white p-3 sm:flex-row sm:items-end"
                    >
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">
                          Ingrediente
                        </label>

                        <select
                          value={item.ingredientId}
                          onChange={(e) =>
                            updateCompositionIngredient(
                              index,
                              "ingredientId",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
                        >
                          <option value="">
                            Selecione um ingrediente
                          </option>

                          {ingredients.map(
                            (ingredient) => (
                              <option
                                key={ingredient.id}
                                value={ingredient.id}
                              >
                                {ingredient.name}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="w-full sm:w-32">
                        <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">
                          Quantidade
                        </label>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateCompositionIngredient(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
                          />

                          {selected && (
                            <span className="text-xs font-medium text-[var(--text-on-light)] opacity-60">
                              {formatUnit(
                                selected.unit
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeCompositionIngredient(
                            index
                          )
                        }
                        className="rounded-lg px-3 py-2 text-xs font-medium text-[var(--danger)] hover:bg-[var(--danger)]/10"
                      >
                        Remover
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setIngredientError(null);
                setShowIngredientModal(true);
              }}
              className="mt-4 text-xs font-semibold text-[var(--gold-deep)] hover:underline"
            >
              + Não encontrou o ingrediente? Cadastrar rapidamente
            </button>
          </div>

          {error && (
            <p className="text-sm text-[var(--danger)]">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] px-5 py-2.5 text-sm font-semibold text-[#1c1006] disabled:opacity-60"
            >
              {saving
                ? "Salvando..."
                : "Salvar produto"}
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

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
        {products.length === 0 ? (
          <p className="p-6 text-sm text-[var(--text-on-light)] opacity-60">
            Nenhum produto cadastrado ainda.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-[var(--text-on-light)] opacity-60">
                <th className="px-6 py-3">
                  Produto
                </th>

                <th className="px-6 py-3">
                  Categoria
                </th>

                <th className="px-6 py-3">
                  Preço
                </th>

                <th className="px-6 py-3">
                  Composição
                </th>

                <th className="px-6 py-3">
                  Margem
                </th>

                <th className="px-6 py-3">
                  Status
                </th>

                <th className="px-6 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-black/5 last:border-0"
                >
                  <td className="px-6 py-3">
                    <p className="font-medium text-[var(--text-h-light)]">
                      {product.name}
                    </p>

                    <p className="text-xs text-[var(--text-on-light)] opacity-60">
                      {product.description}
                    </p>
                  </td>

                  <td className="px-6 py-3 text-[var(--text-on-light)]">
                    {product.categoryName}
                  </td>

                  <td className="px-6 py-3 font-medium text-[var(--text-h-light)]">
                    {formatCurrency(
                      product.priceCents
                    )}
                  </td>

                  <td className="px-6 py-3">
                    {product.ingredients.length ===
                    0 ? (
                      <span className="text-xs text-[var(--text-on-light)] opacity-50">
                        Sem composição
                      </span>
                    ) : (
                      <div className="max-w-xs space-y-1">
                        {product.ingredients.map(
                          (ingredient) => (
                            <p
                              key={ingredient.id}
                              className="text-xs text-[var(--text-on-light)]"
                            >
                              {ingredient.quantity}{" "}
                              {formatUnit(
                                ingredient.unit
                              )}{" "}
                              {ingredient.name}
                            </p>
                          )
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-3">
                    {(() => {
                      const margin = marginInfo(product);
                      if (!margin) {
                        return (
                          <span className="text-xs text-[var(--text-on-light)] opacity-50">
                            Cadastre o custo dos ingredientes
                          </span>
                        );
                      }
                      const positive = margin.profitCents >= 0;
                      return (
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              positive ? "text-[var(--success)]" : "text-[var(--danger)]"
                            }`}
                          >
                            {formatCurrency(margin.profitCents)}
                          </p>
                          <p className="text-xs text-[var(--text-on-light)] opacity-60">
                            {margin.marginPercent.toFixed(0)}% de margem
                          </p>
                        </div>
                      );
                    })()}
                  </td>

                  <td className="px-6 py-3">
                    <button
                      onClick={() =>
                        toggleActive(product)
                      }
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.active
                          ? "bg-[var(--success)]/15 text-[var(--success)]"
                          : "bg-black/5 text-[var(--text-on-light)] opacity-60"
                      }`}
                    >
                      {product.active
                        ? "Ativo"
                        : "Inativo"}
                    </button>
                  </td>

                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() =>
                        handleDelete(product)
                      }
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

      {showIngredientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-[var(--text-h-light)]">
                Cadastro rápido de ingrediente
              </h2>

              <p className="mt-1 text-sm text-[var(--text-on-light)] opacity-60">
                O ingrediente será cadastrado no estoque e
                poderá ser usado imediatamente neste produto.
              </p>
            </div>

            <form
              onSubmit={handleQuickIngredientSubmit}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">
                  Nome
                </label>

                <input
                  value={newIngredientName}
                  onChange={(e) =>
                    setNewIngredientName(
                      e.target.value
                    )
                  }
                  autoFocus
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
                  placeholder="Bacon"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">
                    Quantidade inicial
                  </label>

                  <input
                    value={newIngredientQuantity}
                    onChange={(e) =>
                      setNewIngredientQuantity(
                        e.target.value
                      )
                    }
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
                    placeholder="2000"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">
                    Unidade
                  </label>

                  <select
                    value={newIngredientUnit}
                    onChange={(e) =>
                      setNewIngredientUnit(
                        e.target.value as IngredientUnit
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
              </div>


              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-on-light)]">
                  Custo por unidade (R$) — opcional
                </label>

                <input
                  value={newIngredientCost}
                  onChange={(e) => setNewIngredientCost(e.target.value)}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold-deep)]"
                  placeholder="0,05"
                />
              </div>


              {ingredientError && (
                <p className="text-sm text-[var(--danger)]">
                  {ingredientError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetIngredientModal();
                    setShowIngredientModal(false);
                  }}
                  className="rounded-full bg-[var(--paper-soft)] px-4 py-2 text-sm font-semibold text-[var(--text-h-light)]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingIngredient}
                  className="rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] px-4 py-2 text-sm font-semibold text-[#1c1006] disabled:opacity-60"
                >
                  {savingIngredient
                    ? "Cadastrando..."
                    : "Cadastrar ingrediente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}