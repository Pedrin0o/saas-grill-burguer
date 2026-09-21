import { prisma } from "@/lib/prisma";
import { EstoqueClient } from "@/components/admin/estoque/EstoqueClient";

export default async function EstoquePage() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { quantity: "asc" },
  });

  const initialIngredients = ingredients.map((ingredient) => ({
    id: ingredient.id,
    name: ingredient.name,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    costCents: ingredient.costCents,
    active: ingredient.active,
  }));

  return <EstoqueClient initialIngredients={initialIngredients} />;
}