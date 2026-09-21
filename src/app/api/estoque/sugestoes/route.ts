import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days")) || 30;

  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);

  const [orders, ingredients] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        status: { not: "CANCELADO" },
      },
      select: {
        items: {
          select: {
            quantity: true,
            removedIngredientIds: true,
            product: {
              select: {
                ingredients: {
                  select: { ingredientId: true, quantity: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.ingredient.findMany({
      where: { active: true },
      select: { id: true, name: true, quantity: true, unit: true },
    }),
  ]);

  const consumption = new Map<string, number>();

  for (const order of orders) {
    for (const item of order.items) {
      const removedIds = Array.isArray(item.removedIngredientIds)
        ? (item.removedIngredientIds as string[])
        : [];

      for (const pi of item.product.ingredients) {
        if (removedIds.includes(pi.ingredientId)) continue;
        const consumed = pi.quantity * item.quantity;
        consumption.set(pi.ingredientId, (consumption.get(pi.ingredientId) ?? 0) + consumed);
      }
    }
  }

  const suggestions = ingredients
    .map((ingredient) => {
      const totalConsumed = consumption.get(ingredient.id) ?? 0;
      const avgDaily = totalConsumed / days;
      const daysLeft = avgDaily > 0 ? ingredient.quantity / avgDaily : Infinity;
      // sugere repor o suficiente pra cobrir mais 7 dias de consumo
      const suggestedQty = avgDaily > 0 ? Math.max(0, Math.ceil(avgDaily * 7 - ingredient.quantity)) : 0;

      return {
        id: ingredient.id,
        name: ingredient.name,
        unit: ingredient.unit,
        currentQty: ingredient.quantity,
        avgDaily: Math.round(avgDaily * 10) / 10,
        daysLeft: Number.isFinite(daysLeft) ? Math.round(daysLeft * 10) / 10 : null,
        suggestedQty,
      };
    })
    .filter((s) => s.avgDaily > 0 && s.daysLeft !== null && s.daysLeft <= 7)
    .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0));

  return NextResponse.json({ suggestions, days });
}