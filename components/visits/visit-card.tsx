"use client";

import { DotsThree, ThumbsDown, ThumbsUp, Trash } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StarRating } from "@/components/visits/star-rating";
import { PhotoGallery } from "@/components/visits/photo-gallery";
import type { VisitWithPhotos } from "@/lib/queries/visits";

const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC", // visited_date is a plain date — never TZ-shift it
  }).format(new Date(`${isoDate}T00:00:00Z`));

type VisitCardProps = {
  visit: VisitWithPhotos;
  onDelete?: () => void;
};

export const VisitCard = ({ visit, onDelete }: VisitCardProps) => (
  <article className="flex flex-col gap-3 rounded-lg bg-card p-4 shadow-sm">
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="font-display text-sm font-semibold">
          {formatDate(visit.visited_date)}
        </p>
        <StarRating value={visit.rating} className="mt-1" />
      </div>
      {onDelete && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Visit options"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
          >
            <DotsThree size={22} weight="bold" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            <DropdownMenuItem
              onClick={onDelete}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <Trash size={16} />
              Delete visit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>

    {visit.comment && (
      <p className="text-sm leading-relaxed text-foreground/90">
        {visit.comment}
      </p>
    )}

    {visit.good_things && (
      <div className="flex items-start gap-2 rounded-2xl bg-[#DFF2EE] px-3.5 py-2.5">
        <ThumbsUp size={16} weight="fill" className="mt-0.5 shrink-0 text-[#3E8E7E]" />
        <p className="text-sm text-[#2C6B5E]">{visit.good_things}</p>
      </div>
    )}

    {visit.bad_things && (
      <div className="flex items-start gap-2 rounded-2xl bg-accent px-3.5 py-2.5">
        <ThumbsDown size={16} weight="fill" className="mt-0.5 shrink-0 text-accent-foreground" />
        <p className="text-sm text-accent-foreground">{visit.bad_things}</p>
      </div>
    )}

    <PhotoGallery photos={visit.photos} />
  </article>
);
