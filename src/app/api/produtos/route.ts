import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ProductIngredientInput = {
  ingredientId: string;
  quantity: number;
};

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
    orderBy: [{ name: "asc" }],
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();

  const {
    name,
    description,
    priceCents,
    stockQty,
    categoryName,
    active,
    ingredients,
  } = body as {
    name: string;
    description?: string;
    priceCents: number;
    stockQty?: number;
    categoryName: string;
    active?: boolean;
    ingredients?: ProductIngredientInput[];
  };

  if (!name || !categoryName || typeof priceCents !== "number") {
    return NextResponse.json(
      { error: "Preencha nome, categoria e preço." },
      { status: 400 }
    );
  }

  if (ingredients !== undefined && !Array.isArray(ingredients)) {
    return NextResponse.json(
      { error: "Composição do produto inválida." },
      { status: 400 }
    );
  }

  const normalizedIngredients = (ingredients ?? []).map((item) => ({
    ingredientId: item.ingredientId,
    quantity: item.quantity,
  }));

  const hasInvalidIngredient = normalizedIngredients.some(
    (item) =>
      typeof item.ingredientId !== "string" ||
      !item.ingredientId ||
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
  );

  if (hasInvalidIngredient) {
    return NextResponse.json(
      {
        error:
          "Cada ingrediente precisa ter uma quantidade inteira maior que zero.",
      },
      { status: 400 }
    );
  }

  const ingredientIds = normalizedIngredients.map(
    (item) => item.ingredientId
  );

  if (new Set(ingredientIds).size !== ingredientIds.length) {
    return NextResponse.json(
      {
        error: "O mesmo ingrediente não pode ser adicionado duas vezes.",
      },
      { status: 400 }
    );
  }

  if (ingredientIds.length > 0) {
    const existingIngredients = await prisma.ingredient.findMany({
      where: {
        id: {
          in: ingredientIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingIngredients.length !== ingredientIds.length) {
      return NextResponse.json(
        {
          error: "Um ou mais ingredientes não foram encontrados.",
        },
        { status: 400 }
      );
    }
  }

  let category = await prisma.category.findFirst({
    where: {
      name: {
        equals: categoryName,
        mode: "insensitive",
      },
    },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: categoryName,
      },
    });
  }

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      description: description?.trim() ?? "",
      priceCents,
      stockQty: stockQty ?? 0,
      active: active ?? true,
      categoryId: category.id,

      ingredients: {
        create: normalizedIngredients.map((item) => ({
          ingredientId: item.ingredientId,
          quantity: item.quantity,
        })),
      },
    },

    include: {
      category: true,
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  return NextResponse.json(product, { status: 201 });
}