import type { IngredientUnit } from "@prisma/client";

type ProductIngredientForAvailability = {
  quantity: number;
  ingredient: {
    quantity: number;
    unit: IngredientUnit;
    active: boolean;
  };
};

type ProductForAvailability = {
  active: boolean;
  stockQty: number;
  ingredients: ProductIngredientForAvailability[];
};

export function isProductAvailable(
  product: ProductForAvailability
) {
  if (!product.active) {
    return false;
  }

  // Produtos antigos que ainda não possuem composição
  // continuam usando o estoque antigo.
  if (product.ingredients.length === 0) {
    return product.stockQty > 0;
  }

  return product.ingredients.every(
    (item) =>
      item.ingredient.active &&
      item.ingredient.quantity >= item.quantity
  );
}