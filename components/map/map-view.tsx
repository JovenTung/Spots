"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getCategoryMeta } from "@/lib/categories";
import type { PlaceListItem } from "@/lib/queries/places";

type MapViewProps = {
  places: PlaceListItem[];
  selectedId: string | null;
  onSelect: (place: PlaceListItem | null) => void;
};

const PIN_SVG = (color: string, filled: boolean) => `
  <svg width="34" height="34" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M128 16a88 88 0 0 0-88 88c0 63 75 125 81.6 130.3a10 10 0 0 0 12.8 0C141 229 216 167 216 104a88 88 0 0 0-88-88Z"
      fill="${filled ? color : "oklch(var(--card))"}" stroke="${color}" stroke-width="14"/>
    <circle cx="128" cy="104" r="36" fill="${filled ? "oklch(var(--card))" : color}"/>
  </svg>`;

/** Full interactive map. Dynamically imported with ssr:false — never bundle
 *  mapbox-gl into non-map routes. */
export default function MapView({ places, selectedId, onSelect }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const onSelectRef = useRef(onSelect);
  const hasFitRef = useRef(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: prefersDark
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11",
      center: [0, 20],
      zoom: 1.4,
    });
    map.on("click", () => onSelectRef.current(null));
    mapRef.current = map;
    const markers = markersRef.current;

    return () => {
      // iOS Safari aggressively evicts leaked WebGL contexts — always clean up.
      map.remove();
      mapRef.current = null;
      markers.clear();
      hasFitRef.current = false;
    };
  }, []);

  // Rebuild markers when the filtered place set changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const located = places.filter(
      (p): p is PlaceListItem & { lat: number; lng: number } =>
        p.lat != null && p.lng != null,
    );

    for (const place of located) {
      const category = getCategoryMeta(place.category);
      // Mapbox positions the marker root via `transform` — never touch it.
      // Selection scaling happens on the inner .pin wrapper instead.
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", place.name);
      el.style.cssText =
        "background:none;border:none;padding:4px;cursor:pointer;line-height:0;";
      el.innerHTML =
        `<span class="pin" style="display:inline-block;line-height:0;` +
        `filter:drop-shadow(0 2px 3px oklch(0 0 0 / 0.28));` +
        `transition:transform 0.15s ease;transform-origin:bottom center;">` +
        PIN_SVG(category.color, place.status === "visited") +
        `</span>`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(place);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([place.lng, place.lat])
        .addTo(map);
      markersRef.current.set(place.id, marker);
    }

    if (located.length > 0 && !hasFitRef.current) {
      const bounds = new mapboxgl.LngLatBounds();
      located.forEach((p) => bounds.extend([p.lng, p.lat]));
      map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 800 });
      hasFitRef.current = true;
    }
  }, [places]);

  // Pop the selected pin.
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const pin = marker.getElement().querySelector<HTMLElement>(".pin");
      if (pin) {
        pin.style.transform = id === selectedId ? "scale(1.15)" : "scale(1)";
      }
      marker.getElement().style.zIndex = id === selectedId ? "10" : "1";
    });
  }, [selectedId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
