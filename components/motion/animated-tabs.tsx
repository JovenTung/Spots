"use client";

import { motion, useReducedMotion } from "framer-motion";
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
  /** Unique per tab group on a page — powers the sliding indicator. */
  layoutId: string;
  className?: string;
};

/** Segmented control. The indicator slides because the selection changed. */
export const AnimatedTabs = <T extends string>({
  items,
  value,
  onChange,
  layoutId,
  className,
}: AnimatedTabsProps<T>) => {
  const reduceMotion = useReducedMotion();

  return (
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
              "relative flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors duration-150",
              isActive ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {isActive && (
              <motion.span
                layoutId={reduceMotion ? undefined : layoutId}
                className="absolute inset-0 rounded-full bg-card shadow-sm"
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
};
