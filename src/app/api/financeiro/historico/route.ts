import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toBucketKey(date: Date, granularity: "day" | "month") {
  if (granularity === "day") return date.toISOString().slice(0, 10);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function toBucketLabel(key: string, granularity: "day" | "month") {
  if (granularity === "day") {
    const [, m, d] = key.split("-");
    return `${d}/${m}`;
  }
  const [y, m] = key.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date
    .toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
    .replace(".", "");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 30);

  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : defaultFrom;
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : now;

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  const rangeDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
  const granularity: "day" | "month" = rangeDays <= 45 ? "day" : "month";

  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({
      where: { paymentStatus: "APROVADO", createdAt: { gte: from, lte: to } },
      select: { id: true, customerName: true, totalCents: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.expense.findMany({
      where: { expenseDate: { gte: from, lte: to } },
      select: { id: true, description: true, amountCents: true, category: true, expenseDate: true },
      orderBy: { expenseDate: "desc" },
    }),
  ]);

  // pré-preenche todos os "buckets" do período (zerados), pra o gráfico não pular datas sem movimento
  const buckets = new Map<string, { label: string; entradas: number; saidas: number }>();
  const cursor = new Date(from);
  while (cursor <= to) {
    const key = toBucketKey(cursor, granularity);
    if (!buckets.has(key)) {
      buckets.set(key, { label: toBucketLabel(key, granularity), entradas: 0, saidas: 0 });
    }
    if (granularity === "day") cursor.setDate(cursor.getDate() + 1);
    else cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const order of orders) {
    const bucket = buckets.get(toBucketKey(order.createdAt, granularity));
    if (bucket) bucket.entradas += order.totalCents;
  }
  for (const expense of expenses) {
    const bucket = buckets.get(toBucketKey(expense.expenseDate, granularity));
    if (bucket) bucket.saidas += expense.amountCents;
  }

  const chartData = Array.from(buckets.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([, value]) => value);

  const transactions = [
    ...orders.map((o) => ({
      id: `order-${o.id}`,
      type: "entrada" as const,
      description: `Pedido — ${o.customerName}`,
      amountCents: o.totalCents,
      date: o.createdAt.toISOString(),
      category: null as string | null,
    })),
    ...expenses.map((e) => ({
      id: `expense-${e.id}`,
      type: "saida" as const,
      description: e.description,
      amountCents: e.amountCents,
      date: e.expenseDate.toISOString(),
      category: e.category,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json({ chartData, transactions });
}