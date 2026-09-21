import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: [{ name: "asc" }],
  });

  return NextResponse.json(ingredients);
}

export async function POST(request: Request) {
  const body = await request.json();

  const { name, quantity, unit, active, costCents } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "Informe o nome do ingrediente." },
      { status: 400 }
    );
  }

  if (typeof quantity !== "number" || quantity < 0) {
    return NextResponse.json(
      { error: "Informe uma quantidade válida." },
      { status: 400 }
    );
  }

  if (!["UN", "G", "ML"].includes(unit)) {
    return NextResponse.json(
      { error: "Unidade de estoque inválida." },
      { status: 400 }
    );
  }

  const ingredient = await prisma.ingredient.create({
    data: {
      name: name.trim(),
      quantity,
      unit,
      costCents: typeof costCents === "number" && costCents >= 0 ? costCents : 0,
      active: active ?? true,
    },
  });

  return NextResponse.json(ingredient, { status: 201 });
}