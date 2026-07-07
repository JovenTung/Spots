"use client";

import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { PlaceCategory } from "@/types/database";

type CategoryChipsProps = {
  value: PlaceCategory | null;
  onChange: (value: PlaceCategory | null) => void;
};

/** Horizontally scrollable category filter chips. */
export const CategoryChips = ({ value, onChange }: CategoryChipsProps) => (
  <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none">
    <Chip
      label="All"
      active={value === null}
      activeColor="#2D2A26"
      tint="#EDECE8"
      onClick={() => onChange(null)}
    />
    {CATEGORIES.map((category) => (
      <Chip
        key={category.value}
        label={category.label}
        icon={<category.icon size={15} weight={value === category.value ? "fill" : "regular"} />}
        active={value === category.value}
        activeColor={category.color}
        tint={category.tint}
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
  activeColor,
  tint,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  activeColor: string;
  tint: string;
  onClick: () => void;
}) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.92 }}
    onClick={onClick}
    className={cn(
      "flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 font-display text-sm font-medium transition-colors",
      active ? "text-white" : "text-foreground/70",
    )}
    style={{ backgroundColor: active ? activeColor : tint }}
  >
    {icon}
    {label}
  </motion.button>
);
