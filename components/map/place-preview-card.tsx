"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CaretRight, Star } from "@phosphor-icons/react";
import { getCategoryMeta } from "@/lib/categories";
import { averageRating, type PlaceListItem } from "@/lib/queries/places";

type PlacePreviewCardProps = {
  place: PlaceListItem | null;
};

/** Bottom card for the selected map pin. Enters and exits with the selection —
 *  the motion is what tells you the tap registered. */
export const PlacePreviewCard = ({ place }: PlacePreviewCardProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {place && (
        <motion.div
          key={place.id}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-4 bottom-4 z-overlay"
        >
          <PreviewContent place={place} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PreviewContent = ({ place }: { place: PlaceListItem }) => {
  const category = getCategoryMeta(place.category);
  const rating = averageRating(place.visits);

  return (
    <Link
      href={`/places/${place.id}`}
      className="flex items-center gap-3.5 rounded-lg bg-card p-3 shadow-md"
    >
      <div
        className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md"
        style={{ backgroundColor: category.tint }}
      >
        {place.source_thumbnail_url ? (
          <Image
            src={place.source_thumbnail_url}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <category.icon size={22} style={{ color: category.color }} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{place.name}</p>
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
          <span>
            {place.status === "visited" ? "Visited" : "Want to go"}
          </span>
        </div>
      </div>

      <CaretRight size={15} className="shrink-0 text-muted-foreground/60" />
    </Link>
  );
};
