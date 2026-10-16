import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireSubscription() {
  const user = await requireUser();

  const subscription = await prisma.subscription.findUnique({
    where: {
      userId: user.id,
    },
    include: {
      plan: true,
    },
  });

  if (!subscription || subscription.status !== "ACTIVE") {
    redirect("/planos");
  }

  return {
    user,
    subscription,
    plan: subscription.plan,
  };
}