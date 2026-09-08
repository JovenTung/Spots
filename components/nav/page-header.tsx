"use client";

import { useRouter } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  actions?: React.ReactNode;
  className?: string;
};

/** Sub-page header: back button + title + optional action slot. */
export const PageHeader = ({ title, actions, className }: PageHeaderProps) => {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-header flex min-h-14 items-center gap-1 border-b border-border bg-background/85 px-2 pt-safe backdrop-blur-xl",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-150 active:bg-muted"
      >
        <CaretLeft size={20} />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">{title}</h1>
      {actions}
    </header>
  );
};
