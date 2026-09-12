"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

/** user_id → display name, for "added by" labels in the shared space. */
export const useMembers = () =>
  useQuery({
    queryKey: ["members"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Record<string, string>> => {
      const supabase = createClient();
      const { data } = await supabase
        .from("members")
        .select("user_id, display_name");
      return Object.fromEntries(
        (data ?? []).map((m) => [m.user_id, m.display_name ?? "Someone"]),
      );
    },
  });

export const useCurrentUserId = () =>
  useQuery({
    queryKey: ["current-user-id"],
    staleTime: Infinity,
    queryFn: async (): Promise<string | null> => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id ?? null;
    },
  });
