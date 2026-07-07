import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const proxy = async (request: NextRequest) => updateSession(request);

export default proxy;

export const config = {
  matcher: [
    // Everything except static assets and images.
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
