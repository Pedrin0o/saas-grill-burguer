import { Suspense } from "react";
import { StatsSection } from "./StatsSection";
import { RecentOrdersSection } from "./RecentOrdersSection";
import { StatsSkeleton, RecentOrdersSkeleton } from "@/components/admin/DashboardSkeletons";
import { IconSparkles } from "@/components/admin/icons";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-h-light)]">
          Visão geral
        </h1>
        <p className="mt-1 text-sm text-[var(--text-on-light)] opacity-70">
          Como a Smash Burger House está indo hoje.
        </p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Suspense fallback={<RecentOrdersSkeleton />}>
          <RecentOrdersSection />
        </Suspense>

        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 text-center shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)]">
            <IconSparkles className="h-5 w-5 text-[#1c1006]" />
          </div>
          <h2 className="text-base font-semibold text-[var(--text-h-light)]">
            Avaliações & IA
          </h2>
          <p className="mt-2 text-sm text-[var(--text-on-light)] opacity-60">
            Em breve: suas avaliações do Google e WhatsApp analisadas
            automaticamente aqui.
          </p>
        </div>
      </div>
    </div>
  );
}