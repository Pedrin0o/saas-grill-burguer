import { prisma } from "@/lib/prisma";
import { FinanceiroDashboard } from "@/components/admin/financeiro/FinanceiroDashboard";

export async function FinanceiroSection() {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [expenses, revenueThisMonth] = await Promise.all([
    prisma.expense.findMany({ orderBy: { expenseDate: "desc" }, take: 100 }),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { paymentStatus: "APROVADO", createdAt: { gte: startOfThisMonth } },
    }),
  ]);

  const initialExpenses = expenses.map((e) => ({
    id: e.id,
    description: e.description,
    amountCents: e.amountCents,
    category: e.category,
    paid: e.paid,
    expenseDate: e.expenseDate.toISOString(),
  }));

  return (
    <FinanceiroDashboard
      initialExpenses={initialExpenses}
      revenueThisMonth={revenueThisMonth._sum.totalCents ?? 0}
    />
  );
}