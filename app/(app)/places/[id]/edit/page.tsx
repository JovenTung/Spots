"use client";

import { use } from "react";
import { PageHeader } from "@/components/nav/page-header";
import { PlaceForm } from "@/components/places/place-form";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlace } from "@/lib/queries/places";

export default function EditPlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: place, isPending } = usePlace(id);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Edit spot" />
      <div className="px-5">
        {isPending ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        ) : place ? (
          <PlaceForm place={place} />
        ) : (
          <p className="text-sm text-muted-foreground">
            This spot doesn&apos;t exist (or isn&apos;t yours).
          </p>
        )}
      </div>
    </div>
  );
}
