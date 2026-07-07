import { create } from "zustand";
import type { PlaceCategory, PlaceStatus } from "@/types/database";

export type MapStatusFilter = PlaceStatus | "both";

type UiState = {
  listTab: PlaceStatus;
  categoryFilter: PlaceCategory | null;
  mapStatusFilter: MapStatusFilter;
  setListTab: (tab: PlaceStatus) => void;
  setCategoryFilter: (category: PlaceCategory | null) => void;
  setMapStatusFilter: (filter: MapStatusFilter) => void;
};

export const useUiStore = create<UiState>((set) => ({
  listTab: "want_to_go",
  categoryFilter: null,
  mapStatusFilter: "both",
  setListTab: (listTab) => set({ listTab }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setMapStatusFilter: (mapStatusFilter) => set({ mapStatusFilter }),
}));
