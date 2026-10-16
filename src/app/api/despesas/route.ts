import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // Busca a loja vinculada ao usuário autenticado
    const store = await prisma.store.findUnique({
      where: { ownerId: user.id },
    });

    if (!store) {
      return NextResponse.json({ error: "Loja não encontrada." }, { status: 404 });
    }

    const body = await request.json();
    const { description, amountCents, category, paid, expenseDate } = body;

    if (!description || !amountCents || !category) {
      return NextResponse.json(
        { error: "Descrição, valor e categoria são obrigatórios." },
        { status: 400 }
      );
    }

    // Cria a despesa informando o storeId obrigatório
    const expense = await prisma.expense.create({
      data: {
        description,
        amountCents: Number(amountCents),
        category,
        paid: paid ?? true,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        storeId: store.id,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar despesa:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const store = await prisma.store.findUnique({
      where: { ownerId: user.id },
    });

    if (!store) {
      return NextResponse.json({ error: "Loja não encontrada." }, { status: 404 });
    }

    const expenses = await prisma.expense.findMany({
      where: { storeId: store.id },
      orderBy: { expenseDate: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error("Erro ao listar despesas:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}