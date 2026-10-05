import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ContentItem } from "@/lib/types";
import { hydrate, resetApp } from "../actions";

export interface FavoritesState {
  /** Full items are stored (not just ids) because API results are ephemeral. */
  items: ContentItem[];
}

const initialState: FavoritesState = { items: [] };

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<ContentItem>) {
      const index = state.items.findIndex((i) => i.id === action.payload.id);
      if (index >= 0) state.items.splice(index, 1);
      else state.items.unshift(action.payload);
    },
    removeFavorite(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    /** Persists a new order after drag-and-drop. Unknown ids are ignored. */
    setFavoritesOrder(state, action: PayloadAction<string[]>) {
      const byId = new Map(state.items.map((i) => [i.id, i]));
      const ordered = action.payload.map((id) => byId.get(id)).filter((i): i is ContentItem => Boolean(i));
      const rest = state.items.filter((i) => !action.payload.includes(i.id));
      state.items = [...ordered, ...rest];
    },
    clearFavorites(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrate, (state, action) => {
        const items = action.payload.favorites?.items;
        if (Array.isArray(items)) state.items = items.filter((i) => i && typeof i.id === "string" && typeof i.title === "string");
      })
      .addCase(resetApp, () => initialState);
  },
});

export const { toggleFavorite, removeFavorite, setFavoritesOrder, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
