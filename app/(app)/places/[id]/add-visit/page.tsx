"use client";

import { use } from "react";
import { PageHeader } from "@/components/nav/page-header";
import { VisitForm } from "@/components/visits/visit-form";
import { usePlace } from "@/lib/queries/places";

export default function AddVisitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: place } = usePlace(id);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={place ? `Visit to ${place.name}` : "Log a visit"} />
      <div className="px-5 pb-4">
        <VisitForm placeId={id} />
      </div>
    </div>
  );
}
