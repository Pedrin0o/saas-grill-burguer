import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";
import { AnimatedCurrency } from "@/components/admin/AnimatedCurrency";
import { AnimatedNumber } from "@/components/admin/AnimatedNumber";

export async function StatsSection() {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  try {
    const [thisMonth, lastMonth, ordersToday, ordersThisMonth] =
      await Promise.all([
        prisma.order.aggregate({
          _sum: { totalCents: true },
          where: { paymentStatus: "APROVADO", createdAt: { gte: startOfThisMonth } },
        }),
        prisma.order.aggregate({
          _sum: { totalCents: true },
          where: {
            paymentStatus: "APROVADO",
            createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
          },
        }),
        prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
        prisma.order.count({
          where: { paymentStatus: "APROVADO", createdAt: { gte: startOfThisMonth } },
        }),
      ]);

    const revenueThisMonth = thisMonth._sum.totalCents ?? 0;
    const revenueLastMonth = lastMonth._sum.totalCents ?? 0;
    const growthPct =
      revenueLastMonth > 0
        ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
        : null;
    const avgTicket =
      ordersThisMonth > 0 ? revenueThisMonth / ordersThisMonth : 0;

    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Faturamento do mês"
          value={<AnimatedCurrency cents={revenueThisMonth} />}
          trend={
            growthPct != null
              ? { value: growthPct, label: "vs. mês passado" }
              : null
          }
          hint={growthPct == null ? "sem dados do mês anterior" : undefined}
        />
        <StatCard
          label="Pedidos hoje"
          value={<AnimatedNumber value={ordersToday} />}
          hint="atualizado em tempo real"
        />
        <StatCard
          label="Ticket médio"
          value={<AnimatedCurrency cents={avgTicket} />}
          hint="média do mês atual"
        />
        <StatCard
          label="Crescimento"
          value={growthPct != null ? `${growthPct.toFixed(1)}%` : "—"}
          hint="faturamento vs. mês anterior"
        />
      </div>
    );
  } catch (err) {
    console.error("Erro ao ler estatísticas do dashboard:", err);
    return (
      <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
        Não consegui ler o banco de dados. Confira se rodou `npx prisma
        migrate dev`.
      </div>
    );
  }
}