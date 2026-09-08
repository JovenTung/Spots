"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatedTabs } from "@/components/motion/animated-tabs";
import { CategoryChips } from "@/components/places/category-chips";
import { PlacePreviewCard } from "@/components/map/place-preview-card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlaces, type PlaceListItem } from "@/lib/queries/places";
import { useUiStore, type MapStatusFilter } from "@/stores/ui-store";

const MapView = dynamic(() => import("@/components/map/map-view"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

export default function MapPage() {
  const {
    mapStatusFilter,
    setMapStatusFilter,
    categoryFilter,
    setCategoryFilter,
  } = useUiStore();
  const { data: places } = usePlaces("all", null);
  const [selected, setSelected] = useState<PlaceListItem | null>(null);

  const filtered = (places ?? []).filter((place) => {
    if (mapStatusFilter !== "both" && place.status !== mapStatusFilter)
      return false;
    if (categoryFilter && place.category !== categoryFilter) return false;
    return true;
  });

  // Deselect if the selected pin gets filtered away.
  if (selected && !filtered.some((p) => p.id === selected.id)) {
    setSelected(null);
  }

  return (
    <div
      className="fixed inset-x-0 top-0 z-0"
      style={{ bottom: "calc(4rem + env(safe-area-inset-bottom))" }}
    >
      <MapView
        places={filtered}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
      />

      {/* Floating filters */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 px-4 pt-safe">
        <div className="pointer-events-auto mx-auto mt-3 w-full max-w-md rounded-full bg-card/95 p-1 shadow-md backdrop-blur">
          <AnimatedTabs<MapStatusFilter>
            layoutId="map-status"
            value={mapStatusFilter}
            onChange={setMapStatusFilter}
            items={[
              { value: "want_to_go", label: "Want to go" },
              { value: "both", label: "All" },
              { value: "visited", label: "Visited" },
            ]}
            className="bg-transparent p-0"
          />
        </div>
        <div className="pointer-events-auto mx-auto w-full max-w-md px-1">
          <CategoryChips value={categoryFilter} onChange={setCategoryFilter} />
        </div>
      </div>

      <PlacePreviewCard place={selected} />
    </div>
  );
}
