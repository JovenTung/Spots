"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * List wrapper. The cross-fade fires when the caller changes `key` (a filter
 * or tab change), so the motion reports that the filter applied — it is not a
 * page-load entrance.
 */
export const AnimatedList = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.ul
      className={cn("flex flex-col", className)}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.ul>
  );
};

export const AnimatedItem = ({
  children,
  className,
  onTap,
}: {
  children: React.ReactNode;
  className?: string;
  onTap?: () => void;
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      className={cn("list-none", className)}
      whileTap={reduceMotion || !onTap ? undefined : { scale: 0.98 }}
      onTap={onTap}
    >
      {children}
    </motion.li>
  );
};
