"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretRight, Star } from "@phosphor-icons/react";
import { getCategoryMeta } from "@/lib/categories";
import { averageRating, type PlaceListItem } from "@/lib/queries/places";
import { cn } from "@/lib/utils";

type PlaceCardProps = {
  place: PlaceListItem;
  /** Resolved signed URL for the fallback photo thumbnail, if any. */
  photoUrl?: string;
};

export const PlaceCard = ({ place, photoUrl }: PlaceCardProps) => {
  const category = getCategoryMeta(place.category);
  const rating = averageRating(place.visits);
  const thumbnail = place.source_thumbnail_url ?? photoUrl;

  return (
    <Link
      href={`/places/${place.id}`}
      className="flex items-center gap-3.5 rounded-lg bg-card p-3.5 shadow-sm transition-shadow active:shadow-none"
    >
      <div
        className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
        style={{ backgroundColor: category.tint }}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={place.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <category.icon size={26} style={{ color: category.color }} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-medium">
          {place.name}
        </p>
        {place.address && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {place.address}
          </p>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: category.tint, color: category.color }}
          >
            <category.icon size={11} weight="fill" />
            {category.label}
          </span>
          {rating !== null && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-foreground/80">
              <Star size={12} weight="fill" className="text-amber-400" />
              {rating}
            </span>
          )}
          {place.status === "visited" && place.visits.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {place.visits.length}{" "}
              {place.visits.length === 1 ? "visit" : "visits"}
            </span>
          )}
        </div>
      </div>

      <CaretRight
        size={16}
        className={cn("shrink-0 text-muted-foreground/50")}
      />
    </Link>
  );
};
