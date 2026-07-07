"use client";

import Link from "next/link";
import { MapPin, Plus } from "@phosphor-icons/react";
import { AnimatedTabs } from "@/components/motion/animated-tabs";
import { AnimatedItem, AnimatedList } from "@/components/motion/animated-list";
import { BlurText } from "@/components/motion/blur-text";
import { CategoryChips } from "@/components/places/category-chips";
import { PlaceCard } from "@/components/places/place-card";
import { PlaceListSkeleton } from "@/components/places/place-list-skeleton";
import { usePlaces } from "@/lib/queries/places";
import { useSignedUrls } from "@/lib/queries/photos";
import { useUiStore } from "@/stores/ui-store";
import type { PlaceStatus } from "@/types/database";

export default function PlacesPage() {
  const { listTab, setListTab, categoryFilter, setCategoryFilter } =
    useUiStore();
  const { data: places, isPending } = usePlaces(listTab, categoryFilter);

  // Fallback thumbnails: latest photo for places without a source thumbnail.
  const fallbackPaths = (places ?? [])
    .filter((p) => !p.source_thumbnail_url)
    .map((p) => p.visits.flatMap((v) => v.photos)[0]?.storage_path)
    .filter((path): path is string => Boolean(path));
  const { data: signedUrls } = useSignedUrls(fallbackPaths);

  return (
    <div className="flex flex-col gap-4 px-5 pt-safe">
      <header className="flex items-end justify-between pt-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            <BlurText text="Spots" />
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {listTab === "want_to_go"
              ? "Places on your radar"
              : "Places you've been"}
          </p>
        </div>
      </header>

      <AnimatedTabs<PlaceStatus>
        layoutId="list-status"
        value={listTab}
        onChange={setListTab}
        items={[
          { value: "want_to_go", label: "Want to Go" },
          { value: "visited", label: "Visited" },
        ]}
      />

      <CategoryChips value={categoryFilter} onChange={setCategoryFilter} />

      {isPending ? (
        <PlaceListSkeleton />
      ) : places && places.length > 0 ? (
        <AnimatedList key={`${listTab}-${categoryFilter ?? "all"}`}>
          {places.map((place) => {
            const fallbackPath = place.visits.flatMap((v) => v.photos)[0]
              ?.storage_path;
            return (
              <AnimatedItem key={place.id}>
                <PlaceCard
                  place={place}
                  photoUrl={
                    fallbackPath ? signedUrls?.[fallbackPath] : undefined
                  }
                />
              </AnimatedItem>
            );
          })}
        </AnimatedList>
      ) : (
        <EmptyState tab={listTab} />
      )}
    </div>
  );
}

const EmptyState = ({ tab }: { tab: PlaceStatus }) => (
  <div className="flex flex-col items-center gap-4 rounded-lg bg-card px-6 py-14 text-center shadow-sm">
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
      <MapPin size={30} weight="duotone" className="text-accent-foreground" />
    </span>
    <div>
      <h2 className="font-display text-lg font-semibold">
        <BlurText
          text={tab === "want_to_go" ? "Nowhere on the list yet" : "No visits yet"}
        />
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {tab === "want_to_go"
          ? "Save that place you keep seeing on Instagram."
          : "Been somewhere good? Log it before you forget."}
      </p>
    </div>
    <Link
      href="/places/new"
      className="flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-display text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30"
    >
      <Plus size={16} weight="bold" />
      Add a spot
    </Link>
  </div>
);
