"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ListHeart, MapTrifold, Plus, User } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/places", label: "Spots", icon: ListHeart },
  { href: "/map", label: "Map", icon: MapTrifold },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export const BottomNav = () => {
  const pathname = usePathname();

  // Hide the shell nav on full-screen flows (forms have their own headers).
  const isActive = (href: string) =>
    href === "/places"
      ? pathname === "/places" || pathname.startsWith("/places/")
      : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 pb-safe backdrop-blur-lg">
      <div className="mx-auto flex h-16 w-full max-w-md items-center justify-around px-2">
        {NAV_ITEMS.slice(0, 2).map((item) => (
          <NavLink key={item.href} {...item} active={isActive(item.href)} />
        ))}

        <Link
          href="/places/new"
          aria-label="Add a spot"
          className="relative -mt-6 flex h-14 w-14 items-center justify-center"
        >
          <motion.span
            whileTap={{ scale: 0.88 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/35"
          >
            <Plus size={26} weight="bold" />
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
    className={cn(
      "relative flex min-w-16 flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 transition-colors",
      active ? "text-primary" : "text-muted-foreground",
    )}
  >
    {active && (
      <motion.span
        layoutId="nav-active"
        className="absolute inset-0 rounded-2xl bg-accent"
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
      />
    )}
    <Icon
      size={24}
      weight={active ? "fill" : "regular"}
      className="relative z-10"
    />
    <span className="relative z-10 font-display text-[11px] font-medium">
      {label}
    </span>
  </Link>
);
