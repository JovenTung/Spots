"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { InstagramLogo, LinkSimple, Sparkle } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  isAllowedInstagramUrl,
  canonicalInstagramUrl,
  type ImportRequest,
  type ImportResponse,
} from "@/lib/validation/instagram";
import type { PlaceValues } from "@/lib/validation/place";

type InstagramImportFormProps = {
  onExtracted: (prefill: Partial<PlaceValues>) => void;
};

export const InstagramImportForm = ({
  onExtracted,
}: InstagramImportFormProps) => {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [needsCaption, setNeedsCaption] = useState(false);

  const mutation = useMutation({
    mutationFn: async (body: ImportRequest): Promise<ImportResponse> => {
      const res = await fetch("/api/instagram-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Import failed");
      return json as ImportResponse;
    },
    onSuccess: (data) => {
      if (data.needs_caption) {
        setNeedsCaption(true);
        return;
      }
      if (!data.extraction?.place_name) {
        toast.info(
          "Couldn't spot a place in that post — fill it in manually below",
        );
      } else {
        toast.success(`Found ${data.extraction.place_name}!`);
      }
      onExtracted({
        name: data.extraction?.place_name ?? "",
        category: data.extraction?.category ?? "restaurant",
        address: data.extraction?.city ?? null,
        source_url:
          url && isAllowedInstagramUrl(url)
            ? canonicalInstagramUrl(url)
            : null,
        source_thumbnail_url: data.thumbnail_url ?? null,
      });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleFetchUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllowedInstagramUrl(url.trim())) {
      toast.error("Paste a link like instagram.com/p/… or instagram.com/reel/…");
      return;
    }
    mutation.mutate({ mode: "url", url: url.trim() });
  };

  const handleSubmitCaption = (e: React.FormEvent) => {
    e.preventDefault();
    if (caption.trim().length < 5) {
      toast.error("Paste a bit more of the caption");
      return;
    }
    mutation.mutate({ mode: "caption", caption: caption.trim() });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-lg border border-border p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <InstagramLogo size={18} className="text-muted-foreground" />
        </span>
        <p className="text-sm text-muted-foreground">
          Paste a link to a public post and we&apos;ll pull out the place for
          you. If Instagram won&apos;t share it, paste the caption instead —
          works every time.
        </p>
      </div>

      <form onSubmit={handleFetchUrl} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ig-url">Post link</Label>
          <div className="relative">
            <Input
              id="ig-url"
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder="https://www.instagram.com/p/…"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setNeedsCaption(false);
              }}
              className="h-12 pl-10"
            />
            <LinkSimple
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>
        {!needsCaption && (
          <Button
            type="submit"
            disabled={mutation.isPending}
            size="lg" className="rounded-full"
          >
            <Sparkle size={18} weight="fill" />
            {mutation.isPending ? "Reading the post…" : "Import place"}
          </Button>
        )}
      </form>

      <AnimatePresence>
        {needsCaption && (
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmitCaption}
            className="flex flex-col gap-3"
          >
            <div className="rounded-md bg-accent px-4 py-3 text-sm text-accent-foreground">
              Instagram wouldn&apos;t share that post with us. Copy the caption
              from the app and paste it here instead.
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ig-caption">Caption</Label>
              <Textarea
                id="ig-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Best ramen in Tokyo 🍜 @nakiryu…"
                rows={5}
                maxLength={5000}
                className="rounded-md"
              />
            </div>
            <Button
              type="submit"
              disabled={mutation.isPending}
              size="lg" className="rounded-full"
            >
              <Sparkle size={18} weight="fill" />
              {mutation.isPending ? "Reading the caption…" : "Find the place"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
