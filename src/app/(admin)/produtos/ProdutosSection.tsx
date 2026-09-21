import { prisma } from "@/lib/prisma";
import { ProductsClient } from "@/components/admin/produtos/ProductsClient";

export async function ProdutosSection() {
  const [products, categories, ingredients] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: [{ name: "asc" }],
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
    }),
    prisma.ingredient.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const initialProducts = products.map((p) => {
    const ingredients = p.ingredients.map((item) => ({
      id: item.ingredient.id,
      name: item.ingredient.name,
      quantity: item.quantity,
      unit: item.ingredient.unit,
      costCents: item.ingredient.costCents,
    }));

    // só calcula margem se TODOS os ingredientes tiverem custo cadastrado —
    // senão o número fica enganoso (parecendo mais lucro do que é de verdade)
    const hasCostData =
      ingredients.length > 0 && ingredients.every((i) => i.costCents > 0);
    const estimatedCostCents = hasCostData
      ? ingredients.reduce((sum, i) => sum + i.costCents * i.quantity, 0)
      : null;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      stockQty: p.stockQty,
      active: p.active,
      categoryName: p.category.name,
      ingredients,
      estimatedCostCents,
    };
  });

  const availableIngredients = ingredients.map((ingredient) => ({
    id: ingredient.id,
    name: ingredient.name,
    unit: ingredient.unit,
  }));

  return (
    <ProductsClient
      initialProducts={initialProducts}
      categoryNames={categories.map((c) => c.name)}
      initialIngredients={availableIngredients}
    />
  );
}