"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

type ViewMode = "login" | "esqueci_senha_email" | "esqueci_senha_codigo" | "esqueci_senha_nova";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<ViewMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetCode, setResetCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Validação de senha forte (mínimo 6 caracteres, 1 maiúscula, 1 minúscula)
  const isPasswordValid = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return regex.test(pass);
  };

  // Alterna as etapas limpando alertas
  const switchMode = (newMode: ViewMode) => {
    setError(null);
    setSuccess(null);
    setMode(newMode);
  };

  // 1. LOGIN TRADICIONAL
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("E-mail ou senha incorretos.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  // 2. RECUPERAÇÃO - ETAPA 1: SOLICITAR CÓDIGO
  async function handleRequestResetCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

      if (resetError) throw new Error(resetError.message);

      setSuccess(`Enviamos um código de verificação para ${email}.`);
      setMode("esqueci_senha_codigo");
    } catch (err: any) {
      setError(err.message || "Erro ao solicitar código de recuperação.");
    } finally {
      setLoading(false);
    }
  }

  // 3. RECUPERAÇÃO - ETAPA 2: VALIDAR CÓDIGO RECEBIDO
  async function handleVerifyResetCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: resetCode,
        type: "recovery",
      });

      if (verifyError) throw new Error("Código inválido ou expirado.");

      setSuccess("Código verificado com sucesso! Defina sua nova senha.");
      setMode("esqueci_senha_nova");
    } catch (err: any) {
      setError(err.message || "Erro ao validar o código.");
    } finally {
      setLoading(false);
    }
  }

  // 4. RECUPERAÇÃO - ETAPA 3: SALVAR A NOVA SENHA
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!isPasswordValid(newPassword)) {
      setError("A senha deve ter no mínimo 6 caracteres, contendo pelo menos uma letra maiúscula e uma minúscula.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw new Error(updateError.message);

      setSuccess("Sua senha foi alterada com sucesso! Faça login com a nova senha.");
      setMode("login");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setResetCode("");
    } catch (err: any) {
      setError(err.message || "Erro ao redefinir a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#111111] px-4 py-8">
      <div className="w-full max-w-sm rounded-2xl bg-[#1a1a1a] p-8 shadow-2xl border border-white/5">
        
        {/* LOGO */}
        <div className="mb-8 flex flex-col items-center">
          <span className="text-xl font-bold tracking-wide text-[#f6efe4]">
            SMASH
          </span>
          <small className="mt-1 text-[10px] tracking-[2.5px] text-orange-500">
            BURGER HOUSE
          </small>
        </div>

        {/* TÍTULO DA ETAPA */}
        <h1 className="mb-6 text-center text-lg font-semibold text-[#f6efe4]">
          {mode === "login" && "Painel Administrativo"}
          {mode === "esqueci_senha_email" && "Recuperar Senha"}
          {mode === "esqueci_senha_codigo" && "Validar Código"}
          {mode === "esqueci_senha_nova" && "Criar Nova Senha"}
        </h1>

        {/* MENSAGENS DE ERRO E SUCESSO */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-3 rounded-lg text-sm text-center">
            {success}
          </div>
        )}

        {/* ETAPA 1: LOGIN TRADICIONAL */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition-colors"
                placeholder="voce@smashburger.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-400">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => switchMode("esqueci_senha_email")}
                  className="text-xs text-orange-500 hover:text-orange-400 transition-colors"
                >
                  Esqueci a senha
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 mt-6"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <p className="text-center text-zinc-400 text-sm pt-4">
              Não tem uma conta?{" "}
              <Link href="/cadastro" className="text-orange-500 hover:text-orange-400 transition-colors">
                Cadastre-se
              </Link>
            </p>
          </form>
        )}

        {/* ETAPA 2: PEDIR E-MAIL DE RECUPERAÇÃO */}
        {mode === "esqueci_senha_email" && (
          <form onSubmit={handleRequestResetCode} className="space-y-4">
            <p className="text-xs text-zinc-400 text-center mb-4">
              Informe seu e-mail cadastrado para enviarmos o código de verificação.
            </p>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                E-mail Cadastrado
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition-colors"
                placeholder="voce@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? "Enviando..." : "Enviar Código de Recuperação"}
            </button>

            <button
              type="button"
              onClick={() => switchMode("login")}
              className="w-full text-xs text-zinc-400 hover:text-white transition-colors pt-2 text-center block"
            >
              Voltar ao Login
            </button>
          </form>
        )}

        {/* ETAPA 3: VALIDAR O CÓDIGO RECEBIDO */}
        {mode === "esqueci_senha_codigo" && (
          <form onSubmit={handleVerifyResetCode} className="space-y-4">
            <p className="text-xs text-zinc-400 text-center mb-4">
              Digite o código enviado para <span className="text-white font-medium">{email}</span>.
            </p>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400 text-center">
                Código de 8 dígitos
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-center text-2xl tracking-[0.3em] text-white outline-none focus:border-orange-500 transition-colors"
                placeholder="12345678"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? "Validando..." : "Validar Código"}
            </button>

            <button
              type="button"
              onClick={() => switchMode("esqueci_senha_email")}
              className="w-full text-xs text-zinc-400 hover:text-white transition-colors pt-2 text-center block"
            >
              Reenviar e-mail / Alterar e-mail
            </button>
          </form>
        )}

        {/* ETAPA 4: DEFINIR NOVA SENHA */}
        {mode === "esqueci_senha_nova" && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <p className="text-xs text-zinc-400 text-center mb-4">
              Crie uma nova senha para o seu acesso.
            </p>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                Nova Senha (Mín. 6 chars, 1 Maiúscula, 1 Minúscula)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? "Salvando..." : "Salvar Nova Senha"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}