"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  /** Provide to make it interactive (form mode). */
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
};

/** 1–5 stars; springy pop on select when interactive. */
export const StarRating = ({
  value,
  onChange,
  size,
  className,
}: StarRatingProps) => {
  const reduceMotion = useReducedMotion();
  const starSize = size ?? (onChange ? 36 : 16);

  return (
    <div
      className={cn("flex items-center", onChange ? "gap-2" : "gap-0.5", className)}
      role={onChange ? "radiogroup" : undefined}
      aria-label={onChange ? "Rating" : `Rated ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= value;
        const StarEl = (
          <Star
            size={starSize}
            weight={isFilled ? "fill" : "regular"}
            className={isFilled ? "text-amber-400" : "text-muted-foreground/40"}
          />
        );

        if (!onChange) {
          return <span key={star}>{StarEl}</span>;
        }

        return (
          <motion.button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onChange(star)}
            whileTap={reduceMotion ? undefined : { scale: 1.35 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="flex min-h-11 min-w-9 items-center justify-center"
          >
            {StarEl}
          </motion.button>
        );
      })}
    </div>
  );
};
