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

export const BottomNav = () => {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const isActive = (href: string) =>
    href === "/places"
      ? pathname === "/places" || pathname.startsWith("/places/")
      : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-nav border-t border-border bg-card/85 pb-safe backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-md items-center justify-around px-2">
        {NAV_ITEMS.slice(0, 2).map((item) => (
          <NavLink key={item.href} {...item} active={isActive(item.href)} />
        ))}

        <Link
          href="/places/new"
          aria-label="Add a spot"
          className="flex h-12 w-12 items-center justify-center"
        >
          <motion.span
            whileTap={reduceMotion ? undefined : { scale: 0.92 }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Plus size={22} weight="bold" />
          </motion.span>
        </Link>

        {NAV_ITEMS.slice(2).map((item) => (
          <NavLink key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </div>
    </nav>
  );
};

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
    className={cn(
      "flex min-h-11 min-w-16 flex-col items-center justify-center gap-1 rounded-md transition-colors duration-150",
      active ? "text-foreground" : "text-muted-foreground",
    )}
  >
    <Icon size={22} weight={active ? "fill" : "regular"} />
    <span className="text-micro font-medium">{label}</span>
  </Link>
);
