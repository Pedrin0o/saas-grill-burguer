"use client";

import { useCallback, useState } from "react";
import { FinanceiroClient } from "./FinanceiroClient";
import { FinanceiroHistorico } from "./FinanceiroHistorico";
import { ReceitaDiaria } from "./ReceitaDiaria";
import { DespesasPizza } from "./DespesasPizza";
import { FinanceiroInsights } from "./FinanceiroInsights";

type Expense = {
  id: string;
  description: string;
  amountCents: number;
  category: string;
  paid: boolean;
  expenseDate: string;
};

type FinanceiroDashboardProps = {
  initialExpenses: Expense[];
  revenueThisMonth: number;
};

export function FinanceiroDashboard({ initialExpenses, revenueThisMonth }: FinanceiroDashboardProps) {
  // incrementa a cada mudança de despesa — os gráficos escutam isso e recarregam sozinhos
  const [refreshKey, setRefreshKey] = useState(0);
  const handleDataChange = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <div className="space-y-8">
      <FinanceiroClient
        initialExpenses={initialExpenses}
        revenueThisMonth={revenueThisMonth}
        onDataChange={handleDataChange}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <DespesasPizza refreshKey={refreshKey} />
        </div>
        <div className="lg:col-span-3">
          <ReceitaDiaria refreshKey={refreshKey} />
        </div>
      </div>

      <FinanceiroHistorico refreshKey={refreshKey} />

      <FinanceiroInsights refreshKey={refreshKey} />
    </div>
  );
}