import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { CATEGORIES, isCategory, type Category } from "@/lib/types";
import { hydrate, resetApp } from "../actions";

export type ThemePreference = "light" | "dark" | "system";
export const LANGUAGES = ["en", "hi", "es"] as const;
export type Language = (typeof LANGUAGES)[number];

export interface PreferencesState {
  categories: Category[];
  theme: ThemePreference;
  language: Language;
  liveUpdates: boolean;
}

export const initialPreferences: PreferencesState = {
  categories: ["technology", "sports", "business"],
  theme: "dark",
  language: "en",
  liveUpdates: true,
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState: initialPreferences,
  reducers: {
    /** Toggles a category on/off. At least one category must stay selected. */
    toggleCategory(state, action: PayloadAction<Category>) {
      const cat = action.payload;
      if (state.categories.includes(cat)) {
        if (state.categories.length > 1) state.categories = state.categories.filter((c) => c !== cat);
      } else {
        // Keep the canonical order so cache keys stay stable regardless of click order.
        state.categories = CATEGORIES.filter((c) => c === cat || state.categories.includes(c));
      }
    },
    setCategories(state, action: PayloadAction<Category[]>) {
      const valid = CATEGORIES.filter((c) => action.payload.includes(c));
      if (valid.length) state.categories = valid;
    },
    setTheme(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload;
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    setLiveUpdates(state, action: PayloadAction<boolean>) {
      state.liveUpdates = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrate, (state, action) => sanitizePreferences({ ...state, ...action.payload.preferences }))
      .addCase(resetApp, () => initialPreferences);
  },
});

/** Defends against corrupted / outdated localStorage payloads. */
export function sanitizePreferences(raw: Partial<PreferencesState>): PreferencesState {
  const categories = Array.isArray(raw.categories) ? raw.categories.filter((c) => isCategory(String(c))) : [];
  return {
    categories: categories.length ? CATEGORIES.filter((c) => categories.includes(c)) : initialPreferences.categories,
    theme: raw.theme === "light" || raw.theme === "dark" || raw.theme === "system" ? raw.theme : initialPreferences.theme,
    language: LANGUAGES.includes(raw.language as Language) ? (raw.language as Language) : "en",
    liveUpdates: typeof raw.liveUpdates === "boolean" ? raw.liveUpdates : true,
  };
}

export const { toggleCategory, setCategories, setTheme, setLanguage, setLiveUpdates } = preferencesSlice.actions;
export default preferencesSlice.reducer;
