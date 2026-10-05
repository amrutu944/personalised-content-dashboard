import { createAction } from "@reduxjs/toolkit";
import type { PersistedState } from "./persistence";

/**
 * Dispatched once on the client after reading localStorage. Slices listen for
 * it to merge persisted values; it also flips `meta.hydrated` so the UI knows
 * it can render user-specific content without hydration mismatches.
 */
export const hydrate = createAction<Partial<PersistedState>>("app/hydrate");

/** Wipes all user data (used by "Reset all data" in Settings). */
export const resetApp = createAction("app/reset");
