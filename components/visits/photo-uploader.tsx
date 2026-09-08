"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, X } from "@phosphor-icons/react";

export type PendingPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

type PhotoUploaderProps = {
  photos: PendingPhoto[];
  onChange: (photos: PendingPhoto[]) => void;
};

/**
 * Multi-photo picker. No `capture` attribute — that would hide the iOS
 * photo-library option. Compression happens at submit time.
 */
export const PhotoUploader = ({ photos, onChange }: PhotoUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setError(null);

    const next: PendingPhoto[] = [...photos];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setError("Only images can be added");
        continue;
      }
      next.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removePhoto = (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (photo) URL.revokeObjectURL(photo.previewUrl);
    onChange(photos.filter((p) => p.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2.5">
        <AnimatePresence>
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="relative h-24 w-24"
            >
              <Image
                src={photo.previewUrl}
                alt="Photo to upload"
                fill
                sizes="96px"
                unoptimized
                className="rounded-md object-cover"
              />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => removePhoto(photo.id)}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background shadow-md"
              >
                <X size={14} weight="bold" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => inputRef.current?.click()}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border bg-muted/50 text-muted-foreground"
        >
          <Camera size={24} />
          <span className="text-micro font-medium">Add</span>
        </motion.button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
};
