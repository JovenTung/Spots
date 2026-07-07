/* eslint-disable @next/next/no-img-element */

type MapPreviewProps = {
  lat: number;
  lng: number;
  /** Pin color (category color), with or without leading '#'. */
  color: string;
};

/**
 * Single-pin map preview via the Mapbox Static Images API — a plain <img>,
 * so detail pages never spin up a WebGL context (the full map view stays
 * the app's only one).
 */
export const MapPreview = ({ lat, lng, color }: MapPreviewProps) => {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;

  const pinColor = color.replace("#", "");
  const src =
    `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/` +
    `pin-l+${pinColor}(${lng},${lat})/${lng},${lat},14,0/640x320@2x` +
    `?access_token=${token}&logo=false`;

  return (
    <a
      href={`https://maps.apple.com/?ll=${lat},${lng}&z=16`}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-lg shadow-sm"
    >
      <img
        src={src}
        alt="Map showing this spot's location"
        width={640}
        height={320}
        loading="lazy"
        className="h-40 w-full object-cover"
      />
    </a>
  );
};
