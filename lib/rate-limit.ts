import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Fixed-window rate limit backed by the check_rate_limit() SECURITY DEFINER
 * RPC (see supabase/migrations/0003_rate_limit.sql). Keyed on auth.uid()
 * server-side — callers must already be authenticated.
 *
 * Fails closed: an RPC error counts as "limited".
 */
export const checkRateLimit = async (
  supabase: SupabaseClient,
  action: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> => {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_action: action,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) return false;
  return data === true;
};
