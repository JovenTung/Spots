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
  /** Hex color driving both list chips and map pins. */
  color: string;
  /** Soft tint used for chip backgrounds. */
  tint: string;
  icon: Icon;
};

export const CATEGORIES: CategoryMeta[] = [
  { value: "restaurant", label: "Restaurant", color: "#FF6B5B", tint: "#FFE3DF", icon: ForkKnife },
  { value: "cafe", label: "Cafe", color: "#E8A13C", tint: "#FBEDD7", icon: Coffee },
  { value: "bar", label: "Bar", color: "#9C7BD4", tint: "#EDE6F9", icon: Martini },
  { value: "activity", label: "Activity", color: "#5BB8A6", tint: "#DFF2EE", icon: Confetti },
  { value: "sight", label: "Sight", color: "#5B9BD4", tint: "#E0EDF9", icon: Binoculars },
  { value: "shop", label: "Shop", color: "#E87BA4", tint: "#FBE4ED", icon: ShoppingBag },
  { value: "other", label: "Other", color: "#8E8B85", tint: "#EDECE8", icon: MapPin },
];

export const CATEGORY_VALUES = PLACE_CATEGORIES;

export const getCategoryMeta = (value: PlaceCategory): CategoryMeta =>
  CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
