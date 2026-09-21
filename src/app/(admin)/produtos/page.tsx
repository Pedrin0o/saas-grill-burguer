import { Suspense } from "react";
import { ProdutosSection } from "./ProdutosSection";
import { ProdutosSkeleton } from "@/components/admin/DashboardSkeletons";

export default function ProdutosPage() {
  return (
    <Suspense fallback={<ProdutosSkeleton />}>
      <ProdutosSection />
    </Suspense>
  );
}