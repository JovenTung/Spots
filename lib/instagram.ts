// Server-only helpers for fetching Instagram post metadata.
// Path A: Meta oEmbed (needs META_OEMBED_TOKEN, an approved Meta app).
// Path B: og: meta tags from the public post page (best-effort — usually
// login-walled from datacenter IPs; cheap to try, never relied on).

const FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 512 * 1024;

export type FetchedPost = {
  caption: string;
  thumbnailUrl: string | null;
};

export const fetchViaOEmbed = async (
  canonicalUrl: string,
): Promise<FetchedPost | null> => {
  const token = process.env.META_OEMBED_TOKEN;
  if (!token) return null;

  try {
    const params = new URLSearchParams({
      url: canonicalUrl,
      fields: "title,thumbnail_url",
      access_token: token,
    });
    const res = await fetch(
      `https://graph.facebook.com/v21.0/instagram_oembed?${params}`,
      { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
    );
    if (!res.ok) return null;

    const json = (await res.json()) as {
      title?: string;
      thumbnail_url?: string;
    };
    if (!json.title) return null;
    return { caption: json.title, thumbnailUrl: json.thumbnail_url ?? null };
  } catch {
    return null;
  }
};

const decodeEntities = (text: string): string =>
  text
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const extractMetaContent = (html: string, property: string): string | null => {
  const pattern = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']|` +
      `<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`,
    "i",
  );
  const match = html.match(pattern);
  const content = match?.[1] ?? match?.[2];
  return content ? decodeEntities(content) : null;
};

export const fetchViaOgTags = async (
  canonicalUrl: string,
): Promise<FetchedPost | null> => {
  try {
    // redirect: "manual" — Instagram redirects anonymous requests to a login
    // wall; following redirects blindly is both useless and an SSRF risk.
    const res = await fetch(canonicalUrl, {
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        Accept: "text/html",
      },
    });
    if (!res.ok || !res.body) return null;

    // Read at most MAX_HTML_BYTES — og tags live in <head>.
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    while (received < MAX_HTML_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
    }
    reader.cancel().catch(() => {});
    const html = Buffer.concat(chunks).toString("utf-8");

    const description = extractMetaContent(html, "og:description");
    const title = extractMetaContent(html, "og:title");
    const image = extractMetaContent(html, "og:image");

    const caption = description ?? title;
    if (!caption || caption.length < 5) return null;
    return { caption, thumbnailUrl: image };
  } catch {
    return null;
  }
};
