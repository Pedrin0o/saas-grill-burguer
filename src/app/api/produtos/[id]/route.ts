import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  // só passa pro Prisma os campos que realmente vieram no corpo da requisição
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.description === "string") data.description = body.description;
  if (typeof body.priceCents === "number") data.priceCents = body.priceCents;
  if (typeof body.stockQty === "number") data.stockQty = body.stockQty;
  if (typeof body.active === "boolean") data.active = body.active;

  const product = await prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });

  return NextResponse.json(product);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}