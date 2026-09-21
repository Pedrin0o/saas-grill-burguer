import { prisma } from "@/lib/prisma";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export async function RecentOrdersSection() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      customerName: true,
      totalCents: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)] lg:col-span-2">
      <h2 className="text-base font-semibold text-[var(--text-h-light)]">
        Últimos pedidos
      </h2>

      {orders.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--text-on-light)] opacity-60">
          Nenhum pedido registrado ainda.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-black/5">
          {orders.map((order, index) => (
            <li
              key={order.id}
              className="stagger-fade-in flex items-center justify-between py-3 text-sm"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div>
                <p className="font-medium text-[var(--text-h-light)]">
                  {order.customerName}
                </p>
                <p className="text-xs text-[var(--text-on-light)] opacity-60">
                  {order.createdAt.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[var(--text-h-light)]">
                  {formatCurrency(order.totalCents)}
                </p>
                <p className="text-xs uppercase tracking-wide text-[var(--gold-deep)]">
                  {order.status}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}