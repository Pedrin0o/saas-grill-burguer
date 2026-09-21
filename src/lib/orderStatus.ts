import type { OrderStatus } from "@prisma/client";

// ordem em que um pedido avança na cozinha
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "PENDENTE",
  "PAGO",
  "EM_PREPARO",
  "PRONTO",
  "ENTREGUE",
];

export const ALL_ORDER_STATUSES: OrderStatus[] = [...ORDER_STATUS_FLOW, "CANCELADO"];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  EM_PREPARO: "Em preparo",
  PRONTO: "Pronto",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDENTE: "bg-black/10 text-[var(--text-on-light)]",
  PAGO: "bg-[var(--gold)]/20 text-[var(--gold-deep)]",
  EM_PREPARO: "bg-blue-500/15 text-blue-600",
  PRONTO: "bg-[var(--success)]/15 text-[var(--success)]",
  ENTREGUE: "bg-black/5 text-[var(--text-on-light)] opacity-60",
  CANCELADO: "bg-[var(--danger)]/15 text-[var(--danger)]",
};

// retorna o próximo status na esteira, ou null se já é o último (ou está cancelado)
export function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx === ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[idx + 1];
}