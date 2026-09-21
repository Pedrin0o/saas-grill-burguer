import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;

  const body = await request.json();

  const data: Record<string, unknown> = {};

  if (typeof body.name === "string") {
    data.name = body.name.trim();
  }

  if (typeof body.quantity === "number" && body.quantity >= 0) {
    data.quantity = body.quantity;
  }

  if (["UN", "G", "ML"].includes(body.unit)) {
    data.unit = body.unit;
  }

  if (typeof body.costCents === "number" && body.costCents >= 0) {
    data.costCents = body.costCents;
  }

  if (typeof body.active === "boolean") {
    data.active = body.active;
  }

  const ingredient = await prisma.ingredient.update({
    where: { id },
    data,
  });

  return NextResponse.json(ingredient);
}

export async function DELETE(
  _request: Request,
  { params }: Params
) {
  const { id } = await params;

  await prisma.ingredient.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}