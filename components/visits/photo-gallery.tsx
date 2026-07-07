"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useSignedUrls } from "@/lib/queries/photos";
import type { PhotoRow } from "@/types/database";

/** Horizontal photo strip; tap a photo to view it full-size. */
export const PhotoGallery = ({ photos }: { photos: PhotoRow[] }) => {
  const [openPath, setOpenPath] = useState<string | null>(null);
  const { data: signedUrls } = useSignedUrls(photos.map((p) => p.storage_path));

  if (photos.length === 0) return null;

  const openPhoto = photos.find((p) => p.storage_path === openPath);
  const openUrl = openPath ? signedUrls?.[openPath] : undefined;

  return (
    <>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
        {photos.map((photo) => {
          const url = signedUrls?.[photo.storage_path];
          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => setOpenPath(photo.storage_path)}
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted"
            >
              {url && (
                <Image
                  src={url}
                  alt={photo.caption ?? "Visit photo"}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              )}
            </button>
          );
        })}
      </div>

      <Dialog
        open={openPath !== null}
        onOpenChange={(open) => !open && setOpenPath(null)}
      >
        <DialogContent className="max-w-lg overflow-hidden rounded-3xl border-none bg-black p-0">
          <DialogTitle className="sr-only">
            {openPhoto?.caption ?? "Photo"}
          </DialogTitle>
          {openUrl && (
            <div className="relative aspect-square w-full">
              <Image
                src={openUrl}
                alt={openPhoto?.caption ?? "Visit photo"}
                fill
                sizes="512px"
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
