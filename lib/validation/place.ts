import { z } from "zod";
import { PLACE_CATEGORIES } from "@/types/database";

const httpsUrl = z
  .string()
  .url()
  .max(2000)
  .refine((url) => url.startsWith("https://"), "Must be an https URL");

export const placeSchema = z.object({
  name: z.string().trim().min(1, "Give it a name").max(200),
  category: z.enum(PLACE_CATEGORIES),
  status: z.enum(["want_to_go", "visited"]),
  address: z.string().trim().max(500).nullable().optional(),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  source_url: httpsUrl.nullable().optional(),
  source_thumbnail_url: httpsUrl.nullable().optional(),
});

export const placeUpdateSchema = placeSchema.extend({
  id: z.string().uuid(),
});

export const placeIdSchema = z.object({ id: z.string().uuid() });

export type PlaceValues = z.infer<typeof placeSchema>;
