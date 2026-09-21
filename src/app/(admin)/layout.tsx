import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { UserEmail } from "@/components/admin/UserEmail";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  

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