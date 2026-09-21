import { prisma } from "@/lib/prisma";
import { isProductAvailable } from "@/lib/product-availability";
import { ProductCard } from "@/components/loja/ProductCard";

export default async function CardapioPage() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
    },
    include: {
      category: true,
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
    orderBy: [
      {
        category: {
          order: "asc",
        },
      },
      {
        name: "asc",
      },
    ],
  });

  const availableProducts = products.filter(
    (product) => isProductAvailable(product)
  );

  const formattedProducts =
    availableProducts.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      priceCents: product.priceCents,
      categoryName: product.category.name,

      ingredients: product.ingredients.map(
        (item) => ({
          id: item.ingredient.id,
          name: item.ingredient.name,
          quantity: item.quantity,
          unit: item.ingredient.unit,
        })
      ),
    }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Smash Burger House
        </h1>

        <p className="mt-2 text-sm opacity-70">
          Escolha seu hambúrguer e personalize como
          quiser.
        </p>
      </div>

      {formattedProducts.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm opacity-60">
            Nenhum produto disponível no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {formattedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </main>
  );
}