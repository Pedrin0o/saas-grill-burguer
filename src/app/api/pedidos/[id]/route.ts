import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ALL_ORDER_STATUSES } from "@/lib/orderStatus";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const { status } = body as { status?: string };

  if (!status || !ALL_ORDER_STATUSES.includes(status as (typeof ALL_ORDER_STATUSES)[number])) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status: status as (typeof ALL_ORDER_STATUSES)[number] },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }
}