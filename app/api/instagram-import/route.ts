import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { fetchViaOEmbed, fetchViaOgTags } from "@/lib/instagram";
import {
  extractPlaceFromCaption,
  isCaptionExtractionConfigured,
} from "@/lib/anthropic";
import {
  canonicalInstagramUrl,
  importRequestSchema,
  type ImportResponse,
} from "@/lib/validation/instagram";

const RATE_LIMIT = { action: "instagram_import", max: 10, windowSeconds: 3600 };

export const POST = async (request: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = importRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const allowed = await checkRateLimit(
    supabase,
    RATE_LIMIT.action,
    RATE_LIMIT.max,
    RATE_LIMIT.windowSeconds,
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many imports — try again in a bit" },
      { status: 429 },
    );
  }

  // Resolve a caption via one of the three paths.
  let caption: string;
  let thumbnailUrl: string | null = null;
  let source: ImportResponse["source"];

  if (parsed.data.mode === "caption") {
    caption = parsed.data.caption;
    source = "caption";
  } else {
    const canonical = canonicalInstagramUrl(parsed.data.url);
    if (!canonical) {
      return NextResponse.json(
        { error: "That doesn't look like an Instagram post link" },
        { status: 400 },
      );
    }

    const viaOEmbed = await fetchViaOEmbed(canonical);
    const fetched = viaOEmbed ?? (await fetchViaOgTags(canonical));

    if (!fetched) {
      // Instagram wouldn't give us the post — ask the user to paste the
      // caption instead. This is the expected path, not an error.
      const response: ImportResponse = { source: "og", needs_caption: true };
      return NextResponse.json(response);
    }

    caption = fetched.caption;
    thumbnailUrl = fetched.thumbnailUrl;
    source = viaOEmbed ? "oembed" : "og";
  }

  if (!isCaptionExtractionConfigured()) {
    return NextResponse.json(
      {
        error:
          "Instagram import isn't set up on this deployment — add the spot manually instead.",
      },
      { status: 503 },
    );
  }

  const extraction = await extractPlaceFromCaption(caption);
  if (!extraction) {
    return NextResponse.json(
      { error: "Couldn't read a place from that — try editing the caption" },
      { status: 502 },
    );
  }

  const response: ImportResponse = {
    extraction,
    thumbnail_url: thumbnailUrl,
    source,
  };
  return NextResponse.json(response);
};
