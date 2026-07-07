"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { PhotoRow, VisitRow } from "@/types/database";

export type VisitWithPhotos = VisitRow & { photos: PhotoRow[] };

export const visitsKey = (placeId: string) => ["visits", placeId] as const;

export const useVisits = (placeId: string) =>
  useQuery({
    queryKey: visitsKey(placeId),
    queryFn: async (): Promise<VisitWithPhotos[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("visits")
        .select("*, photos(*)")
        .eq("place_id", placeId)
        .order("visited_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as VisitWithPhotos[];
    },
    enabled: Boolean(placeId),
  });
