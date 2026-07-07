"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Resolves private-bucket storage paths to signed URLs. Cached aggressively —
 * a fresh signed URL is a new query string, which busts the image cache.
 */
export const useSignedUrls = (paths: string[]) =>
  useQuery({
    queryKey: ["signed-urls", ...paths],
    queryFn: async (): Promise<Record<string, string>> => {
      if (paths.length === 0) return {};
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("photos")
        .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
      if (error) throw error;

      const byPath: Record<string, string> = {};
      for (const item of data ?? []) {
        if (item.signedUrl && item.path) byPath[item.path] = item.signedUrl;
      }
      return byPath;
    },
    enabled: paths.length > 0,
    staleTime: 1000 * 60 * 60 * 24, // reuse the same URLs for a day
    gcTime: 1000 * 60 * 60 * 24,
  });
