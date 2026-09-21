import { createClient } from "@/utils/supabase/server";

export async function UserEmail() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  return (
    <span className="hidden text-sm text-[var(--text-on-light)] opacity-80 sm:inline">
      {user.email}
    </span>
  );
}