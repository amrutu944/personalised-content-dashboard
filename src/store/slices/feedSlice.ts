import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Category, ContentItem, ContentType } from "@/lib/types";
import { resetApp } from "../actions";
import { setCategories, toggleCategory } from "./preferencesSlice";

export type TypeFilter = "all" | ContentType;
export const MAX_PENDING_LIVE = 20;

export interface FeedState {
  /** Custom card order from drag-and-drop (item ids). Empty = natural order. */
  order: string[];
  /** Real-time posts received via SSE that the user hasn't revealed yet. */
  pendingLive: ContentItem[];
  /** Real-time posts the user revealed; shown at the top of the feed. */
  live: ContentItem[];
  typeFilter: TypeFilter;
  categoryFilter: Category | "all";
}

const initialState: FeedState = {
  order: [],
  pendingLive: [],
  live: [],
  typeFilter: "all",
  categoryFilter: "all",
};

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    setFeedOrder(state, action: PayloadAction<string[]>) {
      state.order = action.payload;
    },
    resetFeedOrder(state) {
      state.order = [];
    },
    liveItemReceived(state, action: PayloadAction<ContentItem>) {
      const exists = [...state.pendingLive, ...state.live].some((i) => i.id === action.payload.id);
      if (!exists) state.pendingLive = [action.payload, ...state.pendingLive].slice(0, MAX_PENDING_LIVE);
    },
    revealLive(state) {
      state.live = [...state.pendingLive, ...state.live];
      state.pendingLive = [];
    },
    setTypeFilter(state, action: PayloadAction<TypeFilter>) {
      state.typeFilter = action.payload;
    },
    setCategoryFilter(state, action: PayloadAction<Category | "all">) {
      state.categoryFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Changing preferences fetches a brand-new feed, so a stale order is meaningless.
    const resetForNewFeed = (state: FeedState) => {
      state.order = [];
      state.categoryFilter = "all";
    };
    builder
      .addCase(toggleCategory, resetForNewFeed)
      .addCase(setCategories, resetForNewFeed)
      .addCase(resetApp, () => initialState);
  },
});

export const { setFeedOrder, resetFeedOrder, liveItemReceived, revealLive, setTypeFilter, setCategoryFilter } =
  feedSlice.actions;
export default feedSlice.reducer;
