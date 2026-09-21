import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WEEKDAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days")) || 30;

  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "APROVADO",
      createdAt: { gte: from, lte: to },
    },
    select: {
      id: true,
      totalCents: true,
      createdAt: true,
      items: {
        select: {
          quantity: true,
          priceCents: true,
          product: { select: { id: true, name: true } },
        },
      },
    },
  });

  // --- ticket médio ---
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalCents, 0);
  const orderCount = orders.length;
  const avgTicketCents = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

  // --- pedidos por hora do dia (0-23) ---
  const byHour = Array.from({ length: 24 }, (_, hour) => ({ hour, label: `${String(hour).padStart(2, "0")}h`, count: 0, revenue: 0 }));
  for (const order of orders) {
    const hour = order.createdAt.getHours();
    byHour[hour].count += 1;
    byHour[hour].revenue += order.totalCents;
  }

  // --- pedidos por dia da semana (0=domingo) ---
  const byWeekday = Array.from({ length: 7 }, (_, day) => ({ day, label: WEEKDAY_LABELS[day], count: 0, revenue: 0 }));
  for (const order of orders) {
    const day = order.createdAt.getDay();
    byWeekday[day].count += 1;
    byWeekday[day].revenue += order.totalCents;
  }

  const peakHour = [...byHour].sort((a, b) => b.count - a.count)[0] ?? null;
  const peakWeekday = [...byWeekday].sort((a, b) => b.count - a.count)[0] ?? null;

  // --- produtos mais vendidos ---
  const productStats = new Map<string, { productId: string; name: string; quantity: number; revenueCents: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const existing = productStats.get(item.product.id);
      const revenue = item.priceCents * item.quantity;
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenueCents += revenue;
      } else {
        productStats.set(item.product.id, {
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          revenueCents: revenue,
        });
      }
    }
  }

  const topProducts = Array.from(productStats.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return NextResponse.json({
    days,
    orderCount,
    totalRevenueCents: totalRevenue,
    avgTicketCents,
    byHour,
    byWeekday,
    peakHour: peakHour && peakHour.count > 0 ? peakHour : null,
    peakWeekday: peakWeekday && peakWeekday.count > 0 ? peakWeekday : null,
    topProducts,
  });
}