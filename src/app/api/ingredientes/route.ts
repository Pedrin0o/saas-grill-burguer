import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const store = await prisma.store.findUnique({
    where: { ownerId: user.id },
  });

  if (!store) {
    return NextResponse.json({ error: "Loja não encontrada." }, { status: 404 });
  }

  const ingredients = await prisma.ingredient.findMany({
    where: { storeId: store.id },
    orderBy: [{ name: "asc" }],
  });

  return NextResponse.json(ingredients);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const store = await prisma.store.findUnique({
    where: { ownerId: user.id },
  });

  if (!store) {
    return NextResponse.json({ error: "Loja não encontrada." }, { status: 404 });
  }

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
      storeId: store.id,
    },
  });

  return NextResponse.json(ingredient, { status: 201 });
}