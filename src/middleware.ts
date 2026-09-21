import { updateSession } from "@/utils/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pedidos/:path*",
    "/produtos/:path*",
    "/financeiro/:path*",
    "/estoque/:path*",
    "/rivalidades/:path*",
    "/whatsapp/:path*",
    "/ia/:path*",
  ],
};