import { Suspense } from "react";
import { FinanceiroSection } from "./FinanceiroSection";
import { FinanceiroSkeleton } from "@/components/admin/DashboardSkeletons";


export default function FinanceiroPage() {
  return (
    <Suspense fallback={<FinanceiroSkeleton />}>
      <FinanceiroSection />
    </Suspense>
  );
}