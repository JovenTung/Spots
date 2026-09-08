type MapPreviewProps = {
  lat: number;
  lng: number;
};

// The Static Images API takes literal hex, not CSS vars — these mirror
// --primary in each theme (see DESIGN.md).
const PIN = { light: "d3403a", dark: "f26b59" };

const staticSrc = (
  lat: number,
  lng: number,
  token: string,
  theme: "light" | "dark",
) =>
  `https://api.mapbox.com/styles/v1/mapbox/${theme}-v11/static/` +
  `pin-l+${PIN[theme]}(${lng},${lat})/${lng},${lat},14,0/640x320@2x` +
  `?access_token=${token}&logo=false`;

/**
 * Single-pin map preview via the Mapbox Static Images API — a plain <img>,
 * so detail pages never spin up a WebGL context (the full map view stays
 * the app's only one). <picture> swaps the tile style with the OS theme.
 *
 * The pin uses the accent rather than the category colour: with one pin there
 * is nothing to tell apart, so category hue here would be decoration.
 */
export const MapPreview = ({ lat, lng }: MapPreviewProps) => {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;

  return (
    <a
      href={`https://maps.apple.com/?ll=${lat},${lng}&z=16`}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-lg border border-border"
    >
      <picture>
        <source
          media="(prefers-color-scheme: dark)"
          srcSet={staticSrc(lat, lng, token, "dark")}
        />
        <img
          src={staticSrc(lat, lng, token, "light")}
          alt="Map showing this spot's location"
          width={640}
          height={320}
          loading="lazy"
          className="h-40 w-full object-cover"
        />
      </picture>
    </a>
  );
};
