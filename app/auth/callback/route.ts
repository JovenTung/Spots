import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Handles Supabase email confirmation links: both the PKCE `code` flow and
// the `token_hash` OTP flow, depending on project email template settings.
export const GET = async (request: Request) => {
  const { searchParams, origin: requestOrigin } = new URL(request.url);
  // Prefer a configured site URL over the request Host so a spoofed Host
  // header can't steer the redirect (fixed path either way).
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? requestOrigin;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/places`);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${origin}/places`);
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
};
