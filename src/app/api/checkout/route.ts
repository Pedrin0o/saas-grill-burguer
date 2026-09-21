import { NextResponse } from "next/server";

// TODO: implementar de verdade quando chegarmos na fase de pagamento
// (vai criar a preferência de pagamento no Mercado Pago).
export async function POST() {
  return NextResponse.json(
    { error: "Checkout ainda não implementado." },
    { status: 501 }
  );
}