import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { UserEmail } from "@/components/admin/UserEmail";
import { requireSubscription } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSubscription();

  return (
    <AdminShell
      userEmailSlot={
        <Suspense fallback={null}>
          <UserEmail />
        </Suspense>
      }
    >
      {children}
    </AdminShell>
  );
}