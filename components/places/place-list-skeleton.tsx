import { Skeleton } from "@/components/ui/skeleton";

/** Matches the shape of PlaceCard rows so the swap doesn't jump. */
export const PlaceListSkeleton = () => (
  <div className="-mx-2 divide-y divide-border">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3.5 px-2 py-3">
        <Skeleton className="h-14 w-14 shrink-0 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/3 rounded-full" />
          <Skeleton className="h-3 w-1/2 rounded-full" />
          <Skeleton className="h-2.5 w-20 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);
