import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const body = await request.json();
    const planId = body?.planId;

    if (!planId || typeof planId !== "string") {
      return NextResponse.json(
        { error: "Plano não informado." },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.findFirst({
      where: {
        id: planId,
        active: true,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plano não encontrado ou inativo." },
        { status: 404 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "Usuário não possui e-mail." },
        { status: 400 }
      );
    }

    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (existingSubscription?.status === "ACTIVE") {
      return NextResponse.json(
        {
          error: "Você já possui uma assinatura ativa.",
        },
        { status: 400 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const response = await fetch(
      "https://api.mercadopago.com/preapproval",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          reason: `Saas Grill Burguer - Plano ${plan.name}`,
          external_reference: `${user.id}:${plan.id}`,
          payer_email: user.email,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: plan.priceCents / 100,
            currency_id: "BRL",
          },
          back_url: `${siteUrl}/planos`,
          status: "pending",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Mercado Pago:", data);

      return NextResponse.json(
        {
          error: "Não foi possível criar a assinatura no Mercado Pago.",
          details: data,
        },
        { status: response.status }
      );
    }

    const subscription = await prisma.subscription.upsert({
      where: {
        userId: user.id,
      },
      update: {
        planId: plan.id,
        status: "PENDING",
        paymentProvider: "MERCADO_PAGO",
        externalId: data.id,
        canceledAt: null,
      },
      create: {
        userId: user.id,
        planId: plan.id,
        status: "PENDING",
        paymentProvider: "MERCADO_PAGO",
        externalId: data.id,
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      mercadoPagoSubscriptionId: data.id,
      checkoutUrl: data.init_point,
    });
  } catch (error) {
    console.error("Erro ao criar assinatura:", error);

    return NextResponse.json(
      {
        error: "Erro interno ao criar assinatura.",
      },
      { status: 500 }
    );
  }
}