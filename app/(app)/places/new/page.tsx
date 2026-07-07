"use client";

import { useState } from "react";
import { PencilSimple, InstagramLogo } from "@phosphor-icons/react";
import { PageHeader } from "@/components/nav/page-header";
import { AnimatedTabs } from "@/components/motion/animated-tabs";
import { PlaceForm } from "@/components/places/place-form";
import { InstagramImportForm } from "@/components/import/instagram-import-form";
import type { PlaceValues } from "@/lib/validation/place";

type AddMode = "manual" | "instagram";

export default function NewPlacePage() {
  const [mode, setMode] = useState<AddMode>("manual");
  const [prefill, setPrefill] = useState<Partial<PlaceValues> | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Add a spot" />

      <div className="flex flex-col gap-5 px-5">
        <AnimatedTabs<AddMode>
          layoutId="add-mode"
          value={mode}
          onChange={setMode}
          items={[
            {
              value: "manual",
              label: "Manual",
              icon: <PencilSimple size={16} />,
            },
            {
              value: "instagram",
              label: "From Instagram",
              icon: <InstagramLogo size={16} />,
            },
          ]}
        />

        {mode === "manual" || prefill ? (
          <PlaceForm prefill={prefill ?? undefined} key={prefill ? "prefilled" : "blank"} />
        ) : (
          <InstagramImportForm
            onExtracted={(values) => {
              setPrefill(values);
              setMode("manual");
            }}
          />
        )}
      </div>
    </div>
  );
}
