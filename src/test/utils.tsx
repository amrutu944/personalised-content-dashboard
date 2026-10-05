import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";
import i18n from "@/i18n";
import type { ContentItem } from "@/lib/types";
import { makeStore, type RootState } from "@/store";
import { hydrate } from "@/store/actions";

/** Renders UI inside a fresh Redux store + i18n, already "hydrated". */
export function renderWithProviders(
  ui: ReactElement,
  { preloadedState, ...options }: { preloadedState?: Partial<RootState> } & Omit<RenderOptions, "wrapper"> = {},
) {
  const store = makeStore(preloadedState);
  store.dispatch(hydrate({}));
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </Provider>
  );
  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}

export function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: "item-1",
    type: "news",
    title: "Test headline",
    description: "Test description",
    image: null,
    url: "https://example.com/article",
    source: "Test Source",
    category: "technology",
    publishedAt: new Date().toISOString(),
    ...overrides,
  };
}

export const testUser = { name: "Test User", email: "test@example.com", bio: "", avatarColor: "violet" as const, isGuest: false };
