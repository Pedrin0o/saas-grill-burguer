import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SaleItemInput = {
  productId: string;
  quantity: number;
  removedIngredientIds?: string[];
};

export async function GET() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json();

  const { customerName, customerPhone, items } = body as {
    customerName: string;
    customerPhone?: string;
    items: SaleItemInput[];
  };

  if (
    !customerName ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return NextResponse.json(
      {
        error:
          "Informe o cliente e ao menos um produto.",
      },
      { status: 400 }
    );
  }

  const invalidItem = items.some(
    (item) =>
      !item.productId ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
  );

  if (invalidItem) {
    return NextResponse.json(
      {
        error:
          "Todos os produtos precisam ter uma quantidade válida.",
      },
      { status: 400 }
    );
  }

  // Junta produtos repetidos em uma única linha.
  // Junta produtos repetidos que possuem a mesma personalização.
const groupedItems = new Map<
  string,
  {
    productId: string;
    quantity: number;
    removedIngredientIds: string[];
  }
>();

for (const item of items) {
  const removedIngredientIds = [
    ...(item.removedIngredientIds ?? []),
  ].sort();

  const key = `${item.productId}:${removedIngredientIds.join(",")}`;

  const existing = groupedItems.get(key);

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    groupedItems.set(key, {
      productId: item.productId,
      quantity: item.quantity,
      removedIngredientIds,
    });
  }
}

  const normalizedItems = Array.from(groupedItems.values());

  try {
    const order = await prisma.$transaction(
      async (tx) => {
        const products = await tx.product.findMany({
          where: {
            id: {
              in: normalizedItems.map(
                (item) => item.productId
              ),
            },
          },
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        });

        if (
          products.length !== normalizedItems.length
        ) {
          throw new Error(
            "Algum produto selecionado não foi encontrado."
          );
        }

        /*
         * Primeiro verificamos tudo.
         * Nada é descontado enquanto não tivermos certeza
         * de que todos os ingredientes estão disponíveis.
         */
        for (const item of normalizedItems) {
          const product = products.find(
            (p) => p.id === item.productId
          );

          if (!product) {
            throw new Error(
              "Produto não encontrado."
            );
          }

          if (!product.active) {
            throw new Error(
              `O produto "${product.name}" está inativo.`
            );
          }

          if (product.ingredients.length === 0) {
            if (product.stockQty < item.quantity) {
              throw new Error(
                `O produto "${product.name}" está sem estoque suficiente.`
              );
            }

            continue;
          }

          const removedIngredientIds = item.removedIngredientIds ?? [];

          for (const productIngredient of product.ingredients) {
            if (  removedIngredientIds.includes( productIngredient.ingredientId) ) 
              {
                continue;
              }

              const requiredQuantity = productIngredient.quantity * item.quantity;

              if (!productIngredient.ingredient.active) {
                  throw new Error( `O ingrediente "${productIngredient.ingredient.name}" está inativo.` );}

                if (productIngredient.ingredient.quantity < requiredQuantity ) 
                  {
                    throw new Error( `Estoque insuficiente de "${productIngredient.ingredient.name}" para ${product.name}.`);
                  }
          }
        }

        /*
         * Agora que tudo foi validado, fazemos as baixas.
         *
         * updateMany com a condição quantity >= quantidade
         * evita que o estoque fique negativo em concorrência.
         */
        for (const item of normalizedItems) {
          const product = products.find(
            (p) => p.id === item.productId
          )!;

          if (product.ingredients.length === 0) {
            const updatedProduct =
              await tx.product.updateMany({
                where: {
                  id: product.id,
                  stockQty: {
                    gte: item.quantity,
                  },
                },
                data: {
                  stockQty: {
                    decrement: item.quantity,
                  },
                },
              });

            if (updatedProduct.count !== 1) {
              throw new Error(
                `Estoque insuficiente de ${product.name}.`
              );
            }

            continue;
          }

          const removedIngredientIds =
  item.removedIngredientIds ?? [];

for (const productIngredient of product.ingredients) {
  if (
    removedIngredientIds.includes(
      productIngredient.ingredientId
    )
  ) {
    continue;
  }

  const requiredQuantity =
    productIngredient.quantity *
    item.quantity;

  const updatedIngredient =
    await tx.ingredient.updateMany({
      where: {
        id: productIngredient.ingredientId,
        quantity: {
          gte: requiredQuantity,
        },
        active: true,
      },
      data: {
        quantity: {
          decrement: requiredQuantity,
        },
      },
    });

  if (updatedIngredient.count !== 1) {
    throw new Error(
      `Estoque insuficiente de "${productIngredient.ingredient.name}".`
    );
  }
    
    }
      }


        const orderItemsData = normalizedItems.map(
          (item) => {
            const product = products.find(
              (p) => p.id === item.productId
            )!;

            return {
              productId: product.id,
              quantity: item.quantity,
              priceCents: product.priceCents,
              removedIngredientIds:
              item.removedIngredientIds ?? [],
            };
          }
        );

        const totalCents =
          orderItemsData.reduce(
            (sum, item) =>
              sum +
              item.priceCents * item.quantity,
            0
          );

        return tx.order.create({
          data: {
            customerName,
            customerPhone: customerPhone ?? "",
            totalCents,
            status: "PAGO",
            paymentStatus: "APROVADO",
            items: {
              create: orderItemsData,
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      }
    );

    return NextResponse.json(order, {
      status: 201,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível registrar o pedido.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 }
    );
  }
}