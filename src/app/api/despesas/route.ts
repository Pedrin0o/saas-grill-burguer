import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const expenses = await prisma.expense.findMany({
    orderBy: { expenseDate: "desc" },
  });
  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { description, amountCents, category, paid, expenseDate } = body;

  if (!description || typeof amountCents !== "number" || !category) {
    return NextResponse.json(
      { error: "Preencha descrição, valor e categoria." },
      { status: 400 }
    );
  }

  const expense = await prisma.expense.create({
    data: {
      description,
      amountCents,
      category,
      paid: paid ?? true,
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
    },
  });

  return NextResponse.json(expense, { status: 201 });
}