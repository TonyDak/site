"use client";

import { create } from "zustand";

type AdminSection = "site" | "about" | "projects" | "notes";

type AdminUiState = {
  section: AdminSection;
  setSection: (section: AdminSection) => void;
  selectedNoteSlug: string | null;
  setSelectedNoteSlug: (slug: string | null) => void;
};

export const useAdminUiStore = create<AdminUiState>((set) => ({
  section: "site",
  setSection: (section) => set({ section }),
  selectedNoteSlug: null,
  setSelectedNoteSlug: (selectedNoteSlug) => set({ selectedNoteSlug }),
}));
