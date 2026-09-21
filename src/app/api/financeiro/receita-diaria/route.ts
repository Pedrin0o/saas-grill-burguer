import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Period = "hoje" | "7d" | "15d";

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") as Period) ?? "hoje";

  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  if (period === "hoje") {
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: { paymentStatus: "APROVADO", createdAt: { gte: from, lte: to } },
      select: { totalCents: true, createdAt: true },
    });

    const buckets = new Map<number, number>();
    for (let h = 0; h < 24; h++) buckets.set(h, 0);
    for (const o of orders) {
      const h = o.createdAt.getHours();
      buckets.set(h, (buckets.get(h) ?? 0) + o.totalCents);
    }

    // mostra só das 6h às 23h pra não poluir com madrugada vazia
    const data = Array.from(buckets.entries())
      .filter(([h]) => h >= 6)
      .map(([h, total]) => ({ label: `${String(h).padStart(2, "0")}h`, receita: total }));

    const total = orders.reduce((s, o) => s + o.totalCents, 0);
    return NextResponse.json({ data, total });
  }

  const days = period === "7d" ? 7 : 15;
  const from = new Date(now);
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { paymentStatus: "APROVADO", createdAt: { gte: from, lte: to } },
    select: { totalCents: true, createdAt: true },
  });

  const buckets = new Map<string, number>();
  const cursor = new Date(from);
  while (cursor <= to) {
    buckets.set(isoDay(cursor), 0);
    cursor.setDate(cursor.getDate() + 1);
  }
  for (const o of orders) {
    const key = isoDay(o.createdAt);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + o.totalCents);
  }

  const data = Array.from(buckets.entries()).map(([key, total]) => {
    const [, m, d] = key.split("-");
    return { label: `${d}/${m}`, receita: total };
  });

  const total = orders.reduce((s, o) => s + o.totalCents, 0);
  return NextResponse.json({ data, total });
}