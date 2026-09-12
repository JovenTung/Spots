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
import { AddedBy } from "@/components/places/added-by";
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
  <article className="flex flex-col gap-3 rounded-lg border border-border p-4">
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="tabular flex flex-wrap items-center gap-x-1.5 text-sm font-medium text-muted-foreground">
          {formatDate(visit.visited_date)}
          <AddedBy userId={visit.user_id} verb="Logged" />
        </p>
        <StarRating value={visit.rating} className="mt-1.5" />
      </div>
      {onDelete && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Visit options"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-150 active:bg-muted"
          >
            <DotsThree size={22} weight="bold" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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

    {visit.comment && <p className="leading-relaxed">{visit.comment}</p>}

    {(visit.good_things || visit.bad_things) && (
      <dl className="flex flex-col gap-2 border-t border-border pt-3">
        {visit.good_things && (
          <div className="flex items-start gap-2.5">
            <dt className="mt-0.5 shrink-0">
              <ThumbsUp size={15} className="text-muted-foreground" />
              <span className="sr-only">What was good</span>
            </dt>
            <dd className="text-sm">{visit.good_things}</dd>
          </div>
        )}
        {visit.bad_things && (
          <div className="flex items-start gap-2.5">
            <dt className="mt-0.5 shrink-0">
              <ThumbsDown size={15} className="text-muted-foreground" />
              <span className="sr-only">What wasn&apos;t</span>
            </dt>
            <dd className="text-sm">{visit.bad_things}</dd>
          </div>
        )}
      </dl>
    )}

    <PhotoGallery photos={visit.photos} />
  </article>
);
