import {
  Binoculars,
  Coffee,
  Confetti,
  ForkKnife,
  MapPin,
  Martini,
  ShoppingBag,
  type Icon,
} from "@phosphor-icons/react";
import { PLACE_CATEGORIES, type PlaceCategory } from "@/types/database";

export type CategoryMeta = {
  value: PlaceCategory;
  label: string;
  /** Glyph + map-pin color. A CSS var so it re-resolves in dark mode —
   *  inline SVG in the document resolves custom properties too. */
  color: string;
  /** Placeholder-surface tint behind the glyph. */
  tint: string;
  icon: Icon;
};

const meta = (
  value: PlaceCategory,
  label: string,
  key: string,
  icon: Icon,
): CategoryMeta => ({
  value,
  label,
  color: `oklch(var(--cat-${key}))`,
  tint: `oklch(var(--cat-${key}-tint))`,
  icon,
});

export const CATEGORIES: CategoryMeta[] = [
  meta("restaurant", "Restaurant", "restaurant", ForkKnife),
  meta("cafe", "Cafe", "cafe", Coffee),
  meta("bar", "Bar", "bar", Martini),
  meta("activity", "Activity", "activity", Confetti),
  meta("sight", "Sight", "sight", Binoculars),
  meta("shop", "Shop", "shop", ShoppingBag),
  meta("other", "Other", "other", MapPin),
];

export const CATEGORY_VALUES = PLACE_CATEGORIES;

export const getCategoryMeta = (value: PlaceCategory): CategoryMeta =>
  CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
