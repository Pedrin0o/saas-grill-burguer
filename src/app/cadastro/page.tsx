"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function CadastroPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"formulario" | "valida_email">("formulario");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    storeName: "",
    storeSlug: "",
    phone: "",
  });

  const [codes, setCodes] = useState({
    emailCode: "",
  });

  // Validação de senha forte
  const isPasswordValid = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return regex.test(pass);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "storeSlug") {
      const formattedSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
      setFormData({ ...formData, [name]: formattedSlug });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ==========================================
  // ETAPA 1: Enviar formulário e pedir código de E-mail
  // ==========================================
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid(formData.password)) {
      setError("A senha deve ter no mínimo 6 caracteres, contendo pelo menos uma letra maiúscula e uma minúscula.");
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.name },
        },
      });

      if (signUpError) throw new Error(signUpError.message);

      setStep("valida_email");
    } catch (err: any) {
      setError(err.message || "Erro ao iniciar cadastro.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ETAPA 2: Validar E-mail e Criar Loja no Banco
  // ==========================================
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Valida o código OTP de 8 dígitos do e-mail no Supabase
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: codes.emailCode,
        type: "signup",
      });

      if (verifyError) throw new Error("Código de e-mail inválido ou expirado.");

      // 2. Cria a loja/estabelecimento via API do Prisma
      const res = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar estabelecimento.");

      // 3. Redireciona para a seleção de planos
      router.push("/planos");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a1a1a] rounded-2xl p-8 shadow-2xl border border-white/5">
        
        {/* CABEÇALHO */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {step === "formulario" ? "Criar sua conta" : "Confirme seu E-mail"}
          </h1>
          <p className="text-zinc-400 text-sm">
            {step === "formulario"
              ? "Configure seu acesso e os dados da sua hamburgueria"
              : `Enviamos um código para ${formData.email}`}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* ETAPA 1: FORMULÁRIO */}
        {step === "formulario" && (
          <form onSubmit={handleInitialSubmit} className="space-y-4">
            <div className="space-y-4 pb-4 border-b border-white/10">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Seu Nome</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-orange-500"
                  placeholder="João Silva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">E-mail</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-orange-500"
                  placeholder="voce@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Senha (Mín. 6 chars, 1 Maiúscula, 1 Minúscula)
                </label>
                <input
                  required
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-orange-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Nome do Estabelecimento</label>
                <input
                  required
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-orange-500"
                  placeholder="Smash Burger House"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Link do Cardápio</label>
                <div className="flex bg-black/50 border border-white/10 rounded-lg overflow-hidden focus-within:border-orange-500 transition-colors">
                  <span className="px-3 py-2.5 bg-black/40 text-zinc-500 text-sm border-r border-white/10 flex items-center">
                    app.com/
                  </span>
                  <input
                    required
                    type="text"
                    name="storeSlug"
                    value={formData.storeSlug}
                    onChange={handleChange}
                    className="w-full bg-transparent px-3 py-2.5 text-white outline-none text-sm"
                    placeholder="smashburger"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">WhatsApp da Loja (Contato)</label>
                <input
                  required
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-orange-500"
                  placeholder="11999999999"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg mt-6 disabled:opacity-50"
            >
              {loading ? "Processando..." : "Continuar"}
            </button>
          </form>
        )}

        {/* ETAPA 2: VALIDAÇÃO DE E-MAIL */}
        {step === "valida_email" && (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Código de 8 dígitos</label>
              <input
                required
                type="text"
                value={codes.emailCode}
                onChange={(e) => setCodes({ ...codes, emailCode: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-orange-500 text-center text-2xl tracking-[0.3em]"
                maxLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg mt-6 disabled:opacity-50"
            >
              {loading ? "Validando..." : "Validar E-mail e Criar Loja"}
            </button>
          </form>
        )}

        {step === "formulario" && (
          <p className="text-center text-zinc-400 text-sm mt-6">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-orange-500 hover:text-orange-400">
              Fazer login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}