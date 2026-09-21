"use client";

import { useState } from "react";

type IngredientUnit = "UN" | "G" | "ML";

type ProductIngredient = {
  id: string;
  name: string;
  quantity: number;
  unit: IngredientUnit;
};

type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  categoryName: string;
  ingredients: ProductIngredient[];
};

type CartItem = {
  id: string;
  productId: string;
  productName: string;
  priceCents: number;
  quantity: number;
  removedIngredientIds: string[];
  removedIngredientNames: string[];
};

type ProductCardProps = {
  product: Product;
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function formatIngredientQuantity(
  quantity: number,
  unit: IngredientUnit
) {
  if (unit === "G") return `${quantity}g`;
  if (unit === "ML") return `${quantity}ml`;

  return `${quantity} un`;
}

export function ProductCard({
  product,
}: ProductCardProps) {
  const [open, setOpen] = useState(false);

  const [removedIngredients, setRemovedIngredients] =
    useState<string[]>([]);

  function toggleIngredient(id: string) {
    setRemovedIngredients((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function addToCart() {
    const existingCart: CartItem[] = JSON.parse(
      localStorage.getItem("cart") ?? "[]"
    );

    const removedIngredientNames =
      product.ingredients
        .filter((ingredient) =>
          removedIngredients.includes(ingredient.id)
        )
        .map((ingredient) => ingredient.name);

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      priceCents: product.priceCents,
      quantity: 1,
      removedIngredientIds: removedIngredients,
      removedIngredientNames,
    };

    localStorage.setItem(
      "cart",
      JSON.stringify([
        ...existingCart,
        newItem,
      ])
    );

    setRemovedIngredients([]);
    setOpen(false);

    window.dispatchEvent(
      new Event("cart-updated")
    );
  }

  return (
    <>
      <article className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide opacity-50">
          {product.categoryName}
        </p>

        <h2 className="text-xl font-semibold">
          {product.name}
        </h2>

        {product.description && (
          <p className="mt-2 text-sm opacity-70">
            {product.description}
          </p>
        )}

        {product.ingredients.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-50">
              Ingredientes
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.ingredients.map(
                (ingredient) => (
                  <span
                    key={ingredient.id}
                    className="rounded-full bg-black/5 px-2.5 py-1 text-xs"
                  >
                    {ingredient.name}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-lg font-bold">
            {formatCurrency(
              product.priceCents
            )}
          </p>

          <button
            onClick={() => setOpen(true)}
            className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Adicionar
          </button>
        </div>
      </article>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {product.name}
                </h2>

                <p className="mt-1 text-sm opacity-60">
                  Personalize seu hambúrguer.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setRemovedIngredients([]);
                }}
                className="text-xl opacity-50 hover:opacity-100"
              >
                ×
              </button>
            </div>

            {product.ingredients.length > 0 ? (
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold">
                  Escolha o que deseja retirar
                </p>

                <div className="space-y-2">
                  {product.ingredients.map(
                    (ingredient) => {
                      const removed =
                        removedIngredients.includes(
                          ingredient.id
                        );

                      return (
                        <button
                          key={ingredient.id}
                          type="button"
                          onClick={() =>
                            toggleIngredient(
                              ingredient.id
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors ${
                            removed
                              ? "border-black/10 bg-black/5 opacity-60"
                              : "border-black/10 bg-white hover:bg-black/[0.03]"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {ingredient.name}
                            </p>

                            <p className="mt-0.5 text-xs opacity-50">
                              {formatIngredientQuantity(
                                ingredient.quantity,
                                ingredient.unit
                              )}
                            </p>
                          </div>

                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                              removed
                                ? "border-black bg-black text-white"
                                : "border-black/20"
                            }`}
                          >
                            {removed ? "×" : ""}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm opacity-60">
                Este produto não possui ingredientes
                cadastrados.
              </p>
            )}

            {removedIngredients.length > 0 && (
              <div className="mt-4 rounded-xl bg-black/5 p-3">
                <p className="text-xs font-semibold">
                  Sem:
                </p>

                <p className="mt-1 text-sm opacity-70">
                  {product.ingredients
                    .filter((ingredient) =>
                      removedIngredients.includes(
                        ingredient.id
                      )
                    )
                    .map(
                      (ingredient) =>
                        ingredient.name
                    )
                    .join(", ")}
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-xs opacity-50">
                  Total
                </p>

                <p className="text-lg font-bold">
                  {formatCurrency(
                    product.priceCents
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={addToCart}
                className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white"
              >
                Adicionar ao carrinho
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}