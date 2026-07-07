"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/visits/star-rating";
import {
  PhotoUploader,
  type PendingPhoto,
} from "@/components/visits/photo-uploader";
import { createVisit } from "@/lib/actions/visits";
import { visitSchema, type VisitValues } from "@/lib/validation/visit";

const todayIso = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const compressPhoto = async (file: File): Promise<File> =>
  imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.85,
  });

export const VisitForm = ({ placeId }: { placeId: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [visitedDate, setVisitedDate] = useState(todayIso());
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [goodThings, setGoodThings] = useState("");
  const [badThings, setBadThings] = useState("");
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [progress, setProgress] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (values: VisitValues) => {
      setProgress("Saving visit…");
      const result = await createVisit(values);
      if (!result.ok) throw new Error(result.error);

      let uploaded = 0;
      let failed = 0;
      for (const photo of photos) {
        setProgress(`Uploading photo ${uploaded + failed + 1} of ${photos.length}…`);
        try {
          const compressed = await compressPhoto(photo.file);
          const formData = new FormData();
          formData.append("visit_id", result.data.id);
          formData.append("file", compressed, "photo.jpg");
          const res = await fetch("/api/photos", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error("upload failed");
          uploaded += 1;
        } catch {
          failed += 1;
        }
      }
      return { failed };
    },
    onSuccess: ({ failed }) => {
      queryClient.invalidateQueries({ queryKey: ["visits", placeId] });
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["place", placeId] });
      if (failed > 0) {
        toast.warning(
          `Visit saved, but ${failed} photo${failed > 1 ? "s" : ""} didn't upload`,
        );
      } else {
        toast.success("Visit logged");
      }
      router.replace(`/places/${placeId}`);
    },
    onError: (error: Error) => {
      setProgress(null);
      toast.error(error.message || "Couldn't save this visit");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = visitSchema.safeParse({
      place_id: placeId,
      visited_date: visitedDate,
      rating,
      comment,
      good_things: goodThings,
      bad_things: badThings,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the form");
      return;
    }
    mutation.mutate(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="visited-date">When did you go?</Label>
        <Input
          id="visited-date"
          type="date"
          value={visitedDate}
          max={todayIso()}
          onChange={(e) => setVisitedDate(e.target.value)}
          className="h-12 rounded-2xl"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>How was it?</Label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="comment">Notes</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="The vibe, the wait, who you went with…"
          rows={3}
          maxLength={2000}
          className="rounded-2xl"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="good-things" className="text-[#2C6B5E]">
          What was good?
        </Label>
        <Textarea
          id="good-things"
          value={goodThings}
          onChange={(e) => setGoodThings(e.target.value)}
          placeholder="Order this again…"
          rows={2}
          maxLength={2000}
          className="rounded-2xl border-[#9DB5A4]/60 focus-visible:ring-[#5BB8A6]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bad-things" className="text-accent-foreground">
          What was bad?
        </Label>
        <Textarea
          id="bad-things"
          value={badThings}
          onChange={(e) => setBadThings(e.target.value)}
          placeholder="Skip this next time…"
          rows={2}
          maxLength={2000}
          className="rounded-2xl border-accent-foreground/30 focus-visible:ring-destructive"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Photos</Label>
        <PhotoUploader photos={photos} onChange={setPhotos} />
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="mt-1 h-13 min-h-12 rounded-full font-display text-base"
      >
        {mutation.isPending ? (progress ?? "Saving…") : "Save visit"}
      </Button>
    </form>
  );
};
