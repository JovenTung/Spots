"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TabItem<T extends string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

type AnimatedTabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Unique per tab group on a page — powers the sliding pill. */
  layoutId: string;
  className?: string;
};

/** Segmented pill control with a sliding spring indicator. */
export const AnimatedTabs = <T extends string>({
  items,
  value,
  onChange,
  layoutId,
  className,
}: AnimatedTabsProps<T>) => (
  <div
    role="tablist"
    className={cn(
      "flex w-full items-center gap-1 rounded-full bg-muted p-1",
      className,
    )}
  >
    {items.map((item) => {
      const isActive = item.value === value;
      return (
        <button
          key={item.value}
          role="tab"
          type="button"
          aria-selected={isActive}
          onClick={() => onChange(item.value)}
          className={cn(
            "relative flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 font-display text-sm font-medium transition-colors",
            isActive ? "text-primary-foreground" : "text-muted-foreground",
          )}
        >
          {isActive && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-full bg-primary shadow-sm"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {item.icon}
            {item.label}
          </span>
        </button>
      );
    })}
  </div>
);
