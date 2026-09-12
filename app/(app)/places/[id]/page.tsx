"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  DotsThree,
  InstagramLogo,
  MapPin,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { PageHeader } from "@/components/nav/page-header";
import { AnimatedItem, AnimatedList } from "@/components/motion/animated-list";
import { VisitCard } from "@/components/visits/visit-card";
import { StarRating } from "@/components/visits/star-rating";
import { MapPreview } from "@/components/map/map-preview";
import { AddedBy } from "@/components/places/added-by";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { deletePlace, markVisited } from "@/lib/actions/places";
import { deleteVisit } from "@/lib/actions/visits";
import { getCategoryMeta } from "@/lib/categories";
import { usePlace } from "@/lib/queries/places";
import { useSignedUrls } from "@/lib/queries/photos";
import { useVisits } from "@/lib/queries/visits";

export default function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: place, isPending } = usePlace(id);
  const { data: visits } = useVisits(id);

  const heroFallbackPath = visits?.flatMap((v) => v.photos)[0]?.storage_path;
  const { data: signedUrls } = useSignedUrls(
    !place?.source_thumbnail_url && heroFallbackPath ? [heroFallbackPath] : [],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["places"] });
    queryClient.invalidateQueries({ queryKey: ["place", id] });
    queryClient.invalidateQueries({ queryKey: ["visits", id] });
  };

  const markVisitedMutation = useMutation({
    mutationFn: () => markVisited({ id }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      invalidate();
      router.push(`/places/${id}/add-visit`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePlace({ id }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      invalidate();
      toast.success("Spot deleted");
      router.replace("/places");
    },
  });

  const deleteVisitMutation = useMutation({
    mutationFn: (visitId: string) => deleteVisit({ id: visitId }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      invalidate();
      toast.success("Visit deleted");
    },
  });

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="" />
        <div className="flex flex-col gap-4 px-5">
          <Skeleton className="aspect-[3/2] w-full rounded-lg" />
          <Skeleton className="h-6 w-2/3 rounded-full" />
          <Skeleton className="h-4 w-1/2 rounded-full" />
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Not found" />
        <p className="px-5 text-sm text-muted-foreground">
          This spot doesn&apos;t exist (or isn&apos;t yours).
        </p>
      </div>
    );
  }

  const category = getCategoryMeta(place.category);
  const heroUrl =
    place.source_thumbnail_url ??
    (heroFallbackPath ? signedUrls?.[heroFallbackPath] : undefined);

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader
        title={place.name}
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Spot options"
              className="flex h-11 w-11 items-center justify-center rounded-full transition-colors active:bg-muted"
            >
              <DotsThree size={24} weight="bold" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild className="gap-2">
                <Link href={`/places/${place.id}/edit`}>
                  <PencilSimple size={16} />
                  Edit spot
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteOpen(true)}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash size={16} />
                Delete spot
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="flex flex-col gap-5 px-5">
        {/* Hero */}
        <div
          className="relative aspect-[3/2] w-full overflow-hidden rounded-lg border border-border"
          style={{ backgroundColor: category.tint }}
        >
          {heroUrl ? (
            <Image
              src={heroUrl}
              alt={place.name}
              fill
              sizes="(max-width: 448px) 100vw, 448px"
              className="object-cover"
              priority
              unoptimized={heroUrl === place.source_thumbnail_url}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <category.icon size={52} style={{ color: category.color }} />
            </div>
          )}
        </div>

        {/* Title block */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <category.icon size={14} style={{ color: category.color }} />
              {category.label}
            </span>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1">
              {place.status === "visited" && (
                <CheckCircle size={13} weight="fill" />
              )}
              {place.status === "visited" ? "Visited" : "Want to go"}
            </span>
            <AddedBy userId={place.user_id} />
          </div>
          <h2 className="text-2xl font-semibold">{place.name}</h2>
          {visits && visits.length > 0 && (
            <StarRating
              value={Math.round(
                visits.reduce((acc, v) => acc + v.rating, 0) / visits.length,
              )}
            />
          )}
        </div>

        {/* Address + source links */}
        {(place.address || place.source_url) && (
          <div className="flex flex-col overflow-hidden rounded-lg border border-border">
            {place.address && (
              <a
                href={`https://maps.apple.com/?q=${encodeURIComponent(place.name)}&ll=${place.lat ?? ""},${place.lng ?? ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center gap-3 px-4 py-3 transition-colors duration-150 active:bg-muted"
              >
                <MapPin size={18} className="shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 text-sm">{place.address}</span>
              </a>
            )}
            {place.source_url && (
              <a
                href={place.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center gap-3 border-t border-border px-4 py-3 transition-colors duration-150 active:bg-muted"
              >
                <InstagramLogo size={18} className="shrink-0 text-muted-foreground" />
                <span className="text-sm">View original post</span>
              </a>
            )}
          </div>
        )}

        {/* Map preview */}
        {place.lat != null && place.lng != null && (
          <MapPreview lat={place.lat} lng={place.lng} />
        )}

        {/* Primary action */}
        {place.status === "want_to_go" ? (
          <Button
            onClick={() => markVisitedMutation.mutate()}
            disabled={markVisitedMutation.isPending}
            size="lg" className="rounded-full"
          >
            <CheckCircle size={18} weight="fill" />
            {markVisitedMutation.isPending ? "Saving…" : "Mark as visited"}
          </Button>
        ) : (
          <Button
            asChild
            size="lg" className="rounded-full"
          >
            <Link href={`/places/${place.id}/add-visit`}>
              <Plus size={18} weight="bold" />
              Log a visit
            </Link>
          </Button>
        )}

        {/* Visits */}
        {place.status === "visited" && (
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">
              Visits{visits && visits.length > 0 ? ` (${visits.length})` : ""}
            </h3>
            {visits && visits.length > 0 ? (
              <AnimatedList className="gap-3">
                {visits.map((visit) => (
                  <AnimatedItem key={visit.id}>
                    <VisitCard
                      visit={visit}
                      onDelete={() => deleteVisitMutation.mutate(visit.id)}
                    />
                  </AnimatedItem>
                ))}
              </AnimatedList>
            ) : (
              <p className="rounded-lg border border-border px-4 py-6 text-center text-sm text-muted-foreground">
                No visits logged yet. How was it?
              </p>
            )}
          </section>
        )}
      </div>

      {/* Delete confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {place.name}?</DialogTitle>
            <DialogDescription>
              This removes the spot, all its visits, and all photos. There is
              no undo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => setIsDeleteOpen(false)}
            >
              Keep it
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-full"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
