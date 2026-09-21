import { Suspense } from "react";
import { PedidosSection } from "./PedidosSection";
import { PedidosSkeleton } from "@/components/admin/DashboardSkeletons";

export default function PedidosPage() {
  return (
    <Suspense fallback={<PedidosSkeleton />}>
      <PedidosSection />
    </Suspense>
  );
}