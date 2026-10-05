import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { hydrate } from "../actions";

export type LiveStatus = "off" | "connecting" | "live" | "error";

export interface UiState {
  hydrated: boolean;
  sidebarOpen: boolean;
  searchQuery: string;
  liveStatus: LiveStatus;
}

const initialState: UiState = {
  hydrated: false,
  sidebarOpen: false,
  searchQuery: "",
  liveStatus: "off",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload.slice(0, 100);
    },
    setLiveStatus(state, action: PayloadAction<LiveStatus>) {
      state.liveStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrate, (state) => {
      state.hydrated = true;
    });
  },
});

export const { setSidebarOpen, setSearchQuery, setLiveStatus } = uiSlice.actions;
export default uiSlice.reducer;
