import type { Middleware } from "@reduxjs/toolkit";
import type { AuthState } from "./slices/authSlice";
import type { FavoritesState } from "./slices/favoritesSlice";
import type { PreferencesState } from "./slices/preferencesSlice";

/**
 * Minimal, SSR-safe persistence layer (an alternative to redux-persist):
 *  - only whitelisted slices are saved
 *  - writes are debounced so drag-and-drop doesn't hammer localStorage
 *  - reads are validated by each slice's `hydrate` reducer
 */

export const STORAGE_KEY = "pulse:state:v1";

export interface PersistedState {
  preferences: PreferencesState;
  favorites: FavoritesState;
  auth: AuthState;
}

interface PersistableRoot extends PersistedState {
  ui: { hydrated: boolean };
}

export function loadPersistedState(): Partial<PersistedState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedState>) : {};
  } catch {
    return {};
  }
}

export function savePersistedState(state: PersistedState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or disabled (private mode) — app keeps working in memory */
  }
}

export function createPersistenceMiddleware(delay = 250): Middleware {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let last: PersistedState | undefined;
  let pending: PersistedState | undefined;

  const flush = () => {
    clearTimeout(timer);
    if (pending) savePersistedState(pending);
    pending = undefined;
  };
  // Don't lose a change made right before the tab is closed or reloaded.
  if (typeof window !== "undefined") window.addEventListener("pagehide", flush);

  return (store) => (next) => (action) => {
    const result = next(action);
    const state = store.getState() as PersistableRoot;
    // Never write before hydration, or defaults would overwrite saved data.
    if (!state.ui.hydrated || typeof window === "undefined") return result;

    const snapshot: PersistedState = { preferences: state.preferences, favorites: state.favorites, auth: state.auth };
    const changed =
      !last ||
      last.preferences !== snapshot.preferences ||
      last.favorites !== snapshot.favorites ||
      last.auth !== snapshot.auth;
    if (changed) {
      last = snapshot;
      pending = snapshot;
      clearTimeout(timer);
      timer = setTimeout(flush, delay);
    }
    return result;
  };
}
