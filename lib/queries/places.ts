"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { PlaceCategory, PlaceRow, PlaceStatus } from "@/types/database";

export type PlaceListItem = PlaceRow & {
  visits: { rating: number; photos: { storage_path: string }[] }[];
};

export const placesKey = (
  status: PlaceStatus | "all",
  category: PlaceCategory | null,
) => ["places", status, category ?? "all"] as const;

export const usePlaces = (
  status: PlaceStatus | "all",
  category: PlaceCategory | null,
) =>
  useQuery({
    queryKey: placesKey(status, category),
    queryFn: async (): Promise<PlaceListItem[]> => {
      const supabase = createClient();
      let query = supabase
        .from("places")
        .select("*, visits(rating, photos(storage_path))")
        .order("created_at", { ascending: false });

      if (status !== "all") query = query.eq("status", status);
      if (category) query = query.eq("category", category);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as PlaceListItem[];
    },
  });

export const usePlace = (id: string) =>
  useQuery({
    queryKey: ["place", id],
    queryFn: async (): Promise<PlaceRow | null> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as PlaceRow | null;
    },
    enabled: Boolean(id),
  });

export const averageRating = (visits: { rating: number }[]): number | null => {
  if (visits.length === 0) return null;
  const sum = visits.reduce((acc, v) => acc + v.rating, 0);
  return Math.round((sum / visits.length) * 10) / 10;
};
