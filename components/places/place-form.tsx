"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedTabs } from "@/components/motion/animated-tabs";
import { AddressAutocomplete } from "@/components/places/address-autocomplete";
import { createPlace, updatePlace } from "@/lib/actions/places";
import { CATEGORIES } from "@/lib/categories";
import { placeSchema, type PlaceValues } from "@/lib/validation/place";
import { cn } from "@/lib/utils";
import type { PlaceCategory, PlaceRow, PlaceStatus } from "@/types/database";

type PlaceFormProps = {
  /** Existing place → edit mode. */
  place?: PlaceRow;
  /** Prefill from the Instagram import flow. */
  prefill?: Partial<PlaceValues>;
};

export const PlaceForm = ({ place, prefill }: PlaceFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState(place?.name ?? prefill?.name ?? "");
  const [category, setCategory] = useState<PlaceCategory>(
    place?.category ?? prefill?.category ?? "restaurant",
  );
  const [status, setStatus] = useState<PlaceStatus>(
    place?.status ?? prefill?.status ?? "want_to_go",
  );
  const [address, setAddress] = useState(
    place?.address ?? prefill?.address ?? "",
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    place?.lat != null && place?.lng != null
      ? { lat: place.lat, lng: place.lng }
      : null,
  );

  const mutation = useMutation({
    mutationFn: async (values: PlaceValues) =>
      place ? updatePlace({ ...values, id: place.id }) : createPlace(values),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["place"] });
      toast.success(place ? "Spot updated" : "Spot saved");
      router.replace(`/places/${result.data.id}`);
    },
    onError: () => toast.error("Something went wrong"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const values: PlaceValues = {
      name,
      category,
      status,
      address: address.trim() === "" ? null : address.trim(),
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      source_url: place?.source_url ?? prefill?.source_url ?? null,
      source_thumbnail_url:
        place?.source_thumbnail_url ?? prefill?.source_thumbnail_url ?? null,
    };

    const parsed = placeSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the form");
      return;
    }
    mutation.mutate(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="place-name">Name</Label>
        <Input
          id="place-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nakiryu Ramen"
          className="h-12 rounded-2xl"
          maxLength={200}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Category</Label>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((c) => {
            const isActive = category === c.value;
            return (
              <motion.button
                key={c.value}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => setCategory(c.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl border-2 px-1 py-3 transition-colors",
                  isActive ? "border-transparent" : "border-transparent bg-muted",
                )}
                style={
                  isActive
                    ? { backgroundColor: c.tint, borderColor: c.color }
                    : undefined
                }
              >
                <c.icon
                  size={22}
                  weight={isActive ? "fill" : "regular"}
                  style={{ color: isActive ? c.color : undefined }}
                  className={isActive ? undefined : "text-muted-foreground"}
                />
                <span
                  className={cn(
                    "font-display text-[11px] font-medium",
                    isActive ? "" : "text-muted-foreground",
                  )}
                  style={isActive ? { color: c.color } : undefined}
                >
                  {c.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Status</Label>
        <AnimatedTabs<PlaceStatus>
          layoutId="place-form-status"
          value={status}
          onChange={setStatus}
          items={[
            { value: "want_to_go", label: "Want to Go" },
            { value: "visited", label: "Visited" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Address</Label>
        <AddressAutocomplete
          value={address}
          onChange={(next) => {
            setAddress(next);
            setCoords(null);
          }}
          onResolve={(resolved) => {
            setAddress(resolved.fullAddress);
            setCoords({ lat: resolved.lat, lng: resolved.lng });
            if (name.trim() === "") setName(resolved.name);
          }}
        />
        {coords && (
          <p className="text-xs text-muted-foreground">
            📍 Pinned — this spot will show on your map
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="mt-2 h-12 rounded-full font-display text-base"
      >
        {mutation.isPending
          ? "Saving…"
          : place
            ? "Save changes"
            : "Add this spot"}
      </Button>
    </form>
  );
};
