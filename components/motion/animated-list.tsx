"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 340, damping: 28 },
  },
};

/** Staggered spring entrance for card lists (places, visits). */
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
      className={cn("flex flex-col gap-3", className)}
      variants={reduceMotion ? undefined : containerVariants}
      initial={reduceMotion ? false : "hidden"}
      animate="show"
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
      variants={reduceMotion ? undefined : itemVariants}
      whileTap={reduceMotion || !onTap ? undefined : { scale: 0.97 }}
      onTap={onTap}
    >
      {children}
    </motion.li>
  );
};
