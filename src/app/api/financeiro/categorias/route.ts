import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const now = new Date();

  const from = searchParams.get("from")
    ? new Date(searchParams.get("from")!)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : now;

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  const grouped = await prisma.expense.groupBy({
    by: ["category"],
    where: { expenseDate: { gte: from, lte: to } },
    _sum: { amountCents: true },
  });

  const data = grouped
    .map((g) => ({ category: g.category, totalCents: g._sum.amountCents ?? 0 }))
    .filter((g) => g.totalCents > 0)
    .sort((a, b) => b.totalCents - a.totalCents);

  return NextResponse.json({ data });
}