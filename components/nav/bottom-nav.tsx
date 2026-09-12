"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ListBullets, MapTrifold, Plus, User } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/places", label: "Spots", icon: ListBullets },
  { href: "/map", label: "Map", icon: MapTrifold },
  { href: "/profile", label: "Profile", icon: User },
] as const;

/**
 * Four equal columns: three destinations plus the add action. Every item has
 * the same icon-row height and label, so the row aligns on one baseline.
 * (A floating centre button can't actually sit at the bar's centre with an
 * even number of items — it lands in slot 3 of 4 and reads as misplaced.)
 */
export const BottomNav = () => {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/places"
      ? pathname === "/places" || pathname.startsWith("/places/")
      : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-nav border-t border-border bg-card/85 pb-safe backdrop-blur-xl">
      <div className="mx-auto grid h-16 w-full max-w-md grid-cols-4 items-center px-1">
        <NavLink {...NAV_ITEMS[0]} active={isActive(NAV_ITEMS[0].href)} />
        <NavLink {...NAV_ITEMS[1]} active={isActive(NAV_ITEMS[1].href)} />
        <AddLink active={pathname === "/places/new"} />
        <NavLink {...NAV_ITEMS[2]} active={isActive(NAV_ITEMS[2].href)} />
      </div>
    </nav>
  );
};

const itemClass =
  "flex min-h-11 flex-col items-center justify-center gap-1 rounded-md transition-colors duration-150";

const NavLink = ({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: (typeof NAV_ITEMS)[number]["icon"];
  active: boolean;
}) => (
  <Link
    href={href}
    aria-current={active ? "page" : undefined}
    className={cn(itemClass, active ? "text-foreground" : "text-muted-foreground")}
  >
    <span className="flex h-8 items-center">
      <Icon size={22} weight={active ? "fill" : "regular"} />
    </span>
    <span className="text-micro font-medium">{label}</span>
  </Link>
);

const AddLink = ({ active }: { active: boolean }) => {
  const reduceMotion = useReducedMotion();

  return (
    <Link
      href="/places/new"
      aria-current={active ? "page" : undefined}
      className={cn(itemClass, active ? "text-foreground" : "text-muted-foreground")}
    >
      <motion.span
        whileTap={reduceMotion ? undefined : { scale: 0.92 }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
      >
        <Plus size={18} weight="bold" />
      </motion.span>
      <span className="text-micro font-medium">Add</span>
    </Link>
  );
};
