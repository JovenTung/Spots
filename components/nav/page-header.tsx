"use client";

import { useRouter } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  actions?: React.ReactNode;
  className?: string;
};

/** Sub-page header: back button + display title + optional action slot. */
export const PageHeader = ({ title, actions, className }: PageHeaderProps) => {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-14 items-center gap-2 bg-background/90 px-3 pt-safe backdrop-blur-lg",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="flex h-11 w-11 items-center justify-center rounded-full transition-colors active:bg-muted"
      >
        <CaretLeft size={22} />
      </button>
      <h1 className="min-w-0 flex-1 truncate font-display text-lg font-semibold">
        {title}
      </h1>
      {actions}
    </header>
  );
};
