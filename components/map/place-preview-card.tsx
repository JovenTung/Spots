"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CaretRight, Star } from "@phosphor-icons/react";
import { getCategoryMeta } from "@/lib/categories";
import { averageRating, type PlaceListItem } from "@/lib/queries/places";

type PlacePreviewCardProps = {
  place: PlaceListItem | null;
};

/** Springy bottom card shown when a map pin is tapped. */
export const PlacePreviewCard = ({ place }: PlacePreviewCardProps) => (
  <AnimatePresence>
    {place && (
      <motion.div
        key={place.id}
        initial={{ opacity: 0, y: 48, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 48, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="absolute inset-x-4 bottom-4 z-20"
      >
        <PreviewContent place={place} />
      </motion.div>
    )}
  </AnimatePresence>
);

const PreviewContent = ({ place }: { place: PlaceListItem }) => {
  const category = getCategoryMeta(place.category);
  const rating = averageRating(place.visits);

  return (
    <Link
      href={`/places/${place.id}`}
      className="flex items-center gap-3.5 rounded-lg bg-card p-3.5 shadow-xl"
    >
      <div
        className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
        style={{ backgroundColor: category.tint }}
      >
        {place.source_thumbnail_url ? (
          <Image
            src={place.source_thumbnail_url}
            alt={place.name}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <category.icon size={24} style={{ color: category.color }} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-medium">
          {place.name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: category.tint, color: category.color }}
          >
            <category.icon size={11} weight="fill" />
            {category.label}
          </span>
          {rating !== null && (
            <span className="flex items-center gap-0.5 text-xs font-medium">
              <Star size={12} weight="fill" className="text-amber-400" />
              {rating}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground">
            {place.status === "visited" ? "Visited" : "Want to go"}
          </span>
        </div>
      </div>

      <CaretRight size={16} className="shrink-0 text-muted-foreground/50" />
    </Link>
  );
};
