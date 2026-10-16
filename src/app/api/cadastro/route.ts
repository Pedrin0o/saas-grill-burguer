import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, storeName, storeSlug, phone } = body;

    if (!email || !password || !storeName || !storeSlug) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Cria o usuário no Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Falha ao obter ID do usuário." }, { status: 500 });
    }

    // 2. Verifica se o slug já existe para evitar erros
    const existingStore = await prisma.store.findUnique({
      where: { slug: storeSlug.toLowerCase() },
    });

    if (existingStore) {
      // Como o usuário foi criado, o ideal numa API robusta seria reverter ou tratar isso
      return NextResponse.json({ error: "Este link de cardápio já está em uso." }, { status: 400 });
    }

    // 3. Cria a loja vinculada ao usuário
    const store = await prisma.store.create({
      data: {
        name: storeName,
        slug: storeSlug.toLowerCase(),
        phone: phone || null,
        ownerId: userId,
      },
    });

    return NextResponse.json({ success: true, store }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}