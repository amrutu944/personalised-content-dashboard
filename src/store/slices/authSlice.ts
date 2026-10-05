import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { hydrate, resetApp } from "../actions";

/**
 * Mock authentication. No password is ever stored — only the public profile.
 * Swapping in NextAuth.js later would only replace these actions.
 */

export const AVATAR_COLORS = ["violet", "sky", "emerald", "amber", "rose", "fuchsia"] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];

export interface User {
  name: string;
  email: string;
  bio: string;
  avatarColor: AvatarColor;
  isGuest: boolean;
}

export interface AuthState {
  user: User | null;
}

const initialState: AuthState = { user: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ name: string; email: string }>) {
      state.user = {
        name: action.payload.name.trim(),
        email: action.payload.email.trim().toLowerCase(),
        bio: "",
        avatarColor: "violet",
        isGuest: false,
      };
    },
    loginAsGuest(state) {
      state.user = { name: "Guest", email: "guest@pulse.app", bio: "", avatarColor: "sky", isGuest: true };
    },
    logout(state) {
      state.user = null;
    },
    updateProfile(state, action: PayloadAction<Partial<Pick<User, "name" | "bio" | "avatarColor">>>) {
      if (!state.user) return;
      const { name, bio, avatarColor } = action.payload;
      if (name !== undefined && name.trim()) state.user.name = name.trim().slice(0, 40);
      if (bio !== undefined) state.user.bio = bio.slice(0, 160);
      if (avatarColor && AVATAR_COLORS.includes(avatarColor)) state.user.avatarColor = avatarColor;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrate, (state, action) => {
        const user = action.payload.auth?.user;
        if (user && typeof user.name === "string" && typeof user.email === "string") {
          state.user = {
            name: user.name,
            email: user.email,
            bio: typeof user.bio === "string" ? user.bio : "",
            avatarColor: AVATAR_COLORS.includes(user.avatarColor) ? user.avatarColor : "violet",
            isGuest: Boolean(user.isGuest),
          };
        }
      })
      .addCase(resetApp, () => initialState);
  },
});

export const { login, loginAsGuest, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
