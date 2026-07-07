import { z } from "zod";
import { PLACE_CATEGORIES } from "@/types/database";

/** SSRF allowlist: https, exact instagram host, post/reel/tv path only. */
export const isAllowedInstagramUrl = (raw: string): boolean => {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  if (url.hostname !== "www.instagram.com" && url.hostname !== "instagram.com")
    return false;
  return /^\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname);
};

/**
 * Rebuild the URL from validated parts — drops query, fragment, and
 * credentials so only this literal URL is ever fetched.
 */
export const canonicalInstagramUrl = (raw: string): string | null => {
  if (!isAllowedInstagramUrl(raw)) return null;
  const url = new URL(raw);
  const path = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  return `https://www.instagram.com${path.replace(/^\/reels\//, "/reel/")}`;
};

export const importRequestSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("url"),
    url: z
      .string()
      .max(500)
      .refine(isAllowedInstagramUrl, "That doesn't look like an Instagram post link"),
  }),
  z.object({
    mode: z.literal("caption"),
    caption: z.string().trim().min(5, "Paste a bit more of the caption").max(5000),
  }),
]);

export type ImportRequest = z.infer<typeof importRequestSchema>;

export const extractionSchema = z.object({
  place_name: z.string().nullable(),
  city: z.string().nullable(),
  category: z.enum(PLACE_CATEGORIES).nullable(),
});

export type Extraction = z.infer<typeof extractionSchema>;

export type ImportResponse = {
  extraction?: Extraction;
  thumbnail_url?: string | null;
  source: "oembed" | "og" | "caption";
  needs_caption?: boolean;
};
