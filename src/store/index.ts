import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { contentApi } from "./api/contentApi";
import { createPersistenceMiddleware } from "./persistence";
import authReducer from "./slices/authSlice";
import favoritesReducer from "./slices/favoritesSlice";
import feedReducer from "./slices/feedSlice";
import preferencesReducer from "./slices/preferencesSlice";
import uiReducer from "./slices/uiSlice";

export const rootReducer = combineReducers({
  preferences: preferencesReducer,
  favorites: favoritesReducer,
  feed: feedReducer,
  auth: authReducer,
  ui: uiReducer,
  [contentApi.reducerPath]: contentApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/**
 * Store factory. In Next.js App Router a store must be created per request /
 * per browser tab (never a module-level singleton), see StoreProvider.
 */
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) => getDefault().concat(contentApi.middleware, createPersistenceMiddleware()),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
