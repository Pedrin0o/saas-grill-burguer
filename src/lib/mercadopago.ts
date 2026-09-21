import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export const mpPreference = new Preference(client);

/**
 * Cria uma preferência de pagamento a partir dos itens do carrinho.
 * O Mercado Pago devolve uma URL de checkout (init_point) pra redirecionar o cliente.
 */
export async function createPaymentPreference(order: {
  id: string;
  items: { name: string; quantity: number; priceCents: number }[];
}) {
  const result = await mpPreference.create({
    body: {
      external_reference: order.id,
      items: order.items.map((item) => ({
        id: order.id,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.priceCents / 100,
        currency_id: "BRL",
      })),
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/pedido/${order.id}/sucesso`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/pedido/${order.id}/erro`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pedido/${order.id}/pendente`,
      },
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
    },
  });

  return result;
}
