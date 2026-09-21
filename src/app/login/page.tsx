"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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

  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--ink)] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-[var(--ink-soft)] p-8 shadow-2xl"
      >
        <div className="mb-8 flex flex-col items-center">
          <span className="text-xl font-bold tracking-wide text-[#f6efe4]">
            SMASH
          </span>
          <small className="mt-1 text-[10px] tracking-[2.5px] text-[var(--gold)]">
            BURGER HOUSE
          </small>
        </div>

        <h1 className="mb-6 text-center text-lg font-semibold text-[#f6efe4]">
          Painel administrativo
        </h1>

        <label className="mb-1 block text-xs font-medium text-[var(--text-on-dark)]">
          E-mail
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-[#f6efe4] outline-none focus:border-[var(--gold)]"
          placeholder="voce@smashburger.com"
        />

        <label className="mb-1 block text-xs font-medium text-[var(--text-on-dark)]">
          Senha
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-[#f6efe4] outline-none focus:border-[var(--gold)]"
          placeholder="••••••••"
        />

        {error && (
          <p className="mb-4 text-sm text-[var(--danger)]">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] py-2.5 text-sm font-semibold text-[#1c1006] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}