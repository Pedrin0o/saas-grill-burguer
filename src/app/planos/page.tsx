import { prisma } from "@/lib/prisma";
import { AssinarPlanoButton } from "@/components/planos/AssinarPlanoButton";

export default async function PlanosPage() {
  const plans = await prisma.plan.findMany({
    where: {
      active: true,
    },
    orderBy: {
      priceCents: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold">
            Escolha seu plano
          </h1>

          <p className="mt-2 text-gray-600">
            Escolha o plano ideal para sua hamburgueria.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold">
                {plan.name}
              </h2>

              <p className="mt-4 text-3xl font-bold">
                R$ {(plan.priceCents / 100).toFixed(2).replace(".", ",")}
                <span className="text-sm font-normal text-gray-500">
                  /mês
                </span>
              </p>

              <AssinarPlanoButton planId={plan.id} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}