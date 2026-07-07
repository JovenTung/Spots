// Server-safe (no React imports) — UI metadata lives in lib/categories.ts.
export const PLACE_CATEGORIES = [
  "restaurant",
  "cafe",
  "bar",
  "activity",
  "sight",
  "shop",
  "other",
] as const;

export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

export type PlaceStatus = "want_to_go" | "visited";

export type PlaceRow = {
  id: string;
  user_id: string;
  name: string;
  category: PlaceCategory;
  status: PlaceStatus;
  address: string | null;
  lat: number | null;
  lng: number | null;
  source_url: string | null;
  source_thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
};

export type VisitRow = {
  id: string;
  place_id: string;
  user_id: string;
  visited_date: string;
  rating: number;
  comment: string | null;
  good_things: string | null;
  bad_things: string | null;
  created_at: string;
  updated_at: string;
};

export type PhotoRow = {
  id: string;
  visit_id: string;
  user_id: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
};

export type PlaceWithVisitStats = PlaceRow & {
  visits: Pick<VisitRow, "rating">[];
};
