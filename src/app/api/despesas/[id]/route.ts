import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (typeof body.description === "string") data.description = body.description;
  if (typeof body.amountCents === "number") data.amountCents = body.amountCents;
  if (typeof body.category === "string") data.category = body.category;
  if (typeof body.paid === "boolean") data.paid = body.paid;
  if (typeof body.expenseDate === "string") data.expenseDate = new Date(body.expenseDate);

  const expense = await prisma.expense.update({ where: { id }, data });
  return NextResponse.json(expense);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}