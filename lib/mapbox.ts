// Mapbox Search Box API helpers (suggest → retrieve). Search Box (unlike
// Geocoding v6) matches POIs by name — "Nakiryu" finds the ramen shop, not
// just street addresses. Runs client-side with the public token.

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export type AddressSuggestion = {
  mapboxId: string;
  name: string;
  fullAddress: string;
};

export type ResolvedAddress = {
  name: string;
  fullAddress: string;
  lat: number;
  lng: number;
};

export const suggestAddresses = async (
  query: string,
  sessionToken: string,
): Promise<AddressSuggestion[]> => {
  if (!MAPBOX_TOKEN || query.trim().length < 2) return [];

  const params = new URLSearchParams({
    q: query,
    access_token: MAPBOX_TOKEN,
    session_token: sessionToken,
    limit: "6",
    types: "poi,address,place,locality,neighborhood",
  });

  const res = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/suggest?${params}`,
  );
  if (!res.ok) return [];

  const json = (await res.json()) as {
    suggestions?: {
      mapbox_id: string;
      name: string;
      full_address?: string;
      place_formatted?: string;
    }[];
  };

  return (json.suggestions ?? []).map((s) => ({
    mapboxId: s.mapbox_id,
    name: s.name,
    fullAddress: s.full_address ?? s.place_formatted ?? s.name,
  }));
};

export const retrieveAddress = async (
  mapboxId: string,
  sessionToken: string,
): Promise<ResolvedAddress | null> => {
  if (!MAPBOX_TOKEN) return null;

  const params = new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    session_token: sessionToken,
  });

  const res = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(mapboxId)}?${params}`,
  );
  if (!res.ok) return null;

  const json = (await res.json()) as {
    features?: {
      properties: {
        name: string;
        full_address?: string;
        place_formatted?: string;
        coordinates: { latitude: number; longitude: number };
      };
    }[];
  };

  const feature = json.features?.[0];
  if (!feature) return null;

  const { name, full_address, place_formatted, coordinates } =
    feature.properties;
  return {
    name,
    fullAddress: full_address ?? place_formatted ?? name,
    lat: coordinates.latitude,
    lng: coordinates.longitude,
  };
};
