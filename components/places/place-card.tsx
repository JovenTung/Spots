"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretRight, Star } from "@phosphor-icons/react";
import { getCategoryMeta } from "@/lib/categories";
import { averageRating, type PlaceListItem } from "@/lib/queries/places";

type PlaceCardProps = {
  place: PlaceListItem;
  /** Resolved signed URL for the fallback photo thumbnail, if any. */
  photoUrl?: string;
};

/** A row in the places list. Hairline-separated, not a floating card —
 *  a list of places should read as a list. */
export const PlaceCard = ({ place, photoUrl }: PlaceCardProps) => {
  const category = getCategoryMeta(place.category);
  const rating = averageRating(place.visits);
  const thumbnail = place.source_thumbnail_url ?? photoUrl;

  return (
    <Link
      href={`/places/${place.id}`}
      className="group flex items-center gap-3.5 rounded-lg px-2 py-3 transition-colors duration-150 active:bg-muted"
    >
      <div
        className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md"
        style={{ backgroundColor: category.tint }}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
            // Instagram CDN thumbnails bypass /_next/image (already optimized;
            // keeps the optimizer locked to our own Supabase host).
            unoptimized={thumbnail === place.source_thumbnail_url}
          />
        ) : (
          <category.icon size={22} style={{ color: category.color }} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{place.name}</p>
        {place.address && (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {place.address}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2.5 text-micro text-muted-foreground">
          <span className="flex items-center gap-1">
            <category.icon size={12} style={{ color: category.color }} />
            {category.label}
          </span>
          {rating !== null && (
            <span className="tabular flex items-center gap-0.5">
              <Star size={11} weight="fill" className="text-star" />
              {rating}
            </span>
          )}
          {place.status === "visited" && place.visits.length > 0 && (
            <span className="tabular">
              {place.visits.length}{" "}
              {place.visits.length === 1 ? "visit" : "visits"}
            </span>
          )}
        </div>
      </div>

      <CaretRight size={15} className="shrink-0 text-muted-foreground/60" />
    </Link>
  );
};
