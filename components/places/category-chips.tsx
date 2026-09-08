"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { PlaceCategory } from "@/types/database";

type CategoryChipsProps = {
  value: PlaceCategory | null;
  onChange: (value: PlaceCategory | null) => void;
};

/** Category filter. Chips are neutral: colour here would be decoration, and
 *  seven saturated pills is what made the old list feel like a game board. */
export const CategoryChips = ({ value, onChange }: CategoryChipsProps) => (
  <div
    role="group"
    aria-label="Filter by category"
    className="-mx-5 flex gap-2 overflow-x-auto px-5 py-0.5 scrollbar-none"
  >
    <Chip
      label="All"
      active={value === null}
      onClick={() => onChange(null)}
    />
    {CATEGORIES.map((category) => (
      <Chip
        key={category.value}
        label={category.label}
        icon={<category.icon size={14} />}
        active={value === category.value}
        onClick={() =>
          onChange(value === category.value ? null : category.value)
        }
      />
    ))}
  </div>
);

const Chip = ({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      aria-pressed={active}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      onClick={onClick}
      className={cn(
        "flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors duration-150",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground active:bg-muted",
      )}
    >
      {icon}
      {label}
    </motion.button>
  );
};
