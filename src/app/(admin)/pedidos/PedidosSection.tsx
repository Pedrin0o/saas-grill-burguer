import { prisma } from "@/lib/prisma";
import { PedidosClient } from "@/components/admin/pedidos/PedidosClient";
import { isProductAvailable } from "@/lib/product-availability";

export async function PedidosSection() {
  const [orders, products] = await Promise.all([
    prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),

    prisma.product.findMany({
      where: {
        active: true,
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const initialOrders = orders.map((o) => ({
    id: o.id,
    customerName: o.customerName,
    totalCents: o.totalCents,
    status: o.status,
    createdAt: o.createdAt.toISOString(),

    items: o.items.map((i) => ({
      productName: i.product.name,
      quantity: i.quantity,
      priceCents: i.priceCents,
    })),
  }));

  const availableProducts = products
    .filter((product) =>
      isProductAvailable(product)
    )
    .map((p) => ({
      id: p.id,
      name: p.name,
      priceCents: p.priceCents,
    }));

  return (
    <PedidosClient
      initialOrders={initialOrders}
      availableProducts={availableProducts}
    />
  );
}