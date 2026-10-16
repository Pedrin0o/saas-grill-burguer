"use client";

import { useState } from "react";

type AssinarPlanoButtonProps = {
  planId: string;
};

export function AssinarPlanoButton({
  planId,
}: AssinarPlanoButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleAssinar() {
    try {
      setLoading(true);

      const response = await fetch("/api/assinaturas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Não foi possível iniciar a assinatura.");
        return;
      }

      if (!data.checkoutUrl) {
        alert("O Mercado Pago não retornou o link de pagamento.");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error(error);

      alert("Erro ao iniciar a assinatura.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleAssinar}
      disabled={loading}
      className="mt-6 w-full rounded-lg bg-black px-4 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Carregando..." : "Assinar plano"}
    </button>
  );
}