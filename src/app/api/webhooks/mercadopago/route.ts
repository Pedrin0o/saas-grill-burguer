import { NextResponse } from "next/server";

// TODO: implementar de verdade quando chegarmos na fase de pagamento
// (vai receber a confirmação de pagamento do Mercado Pago).
export async function POST() {
  return NextResponse.json({ received: true });
}