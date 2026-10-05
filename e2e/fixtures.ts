import { test as base, expect, type Page } from "@playwright/test";

export const STORAGE_KEY = "pulse:state:v1";

/** Seeds localStorage so tests start already signed in (skips the login UI). */
export async function signIn(page: Page, overrides: Record<string, unknown> = {}) {
  const state = {
    auth: { user: { name: "E2E Tester", email: "e2e@pulse.app", bio: "", avatarColor: "violet", isGuest: false } },
    preferences: { categories: ["technology", "sports", "business"], theme: "dark", language: "en", liveUpdates: false },
    favorites: { items: [] },
    ...overrides,
  };
  await page.addInitScript(
    ({ key, value }) => {
      if (!window.localStorage.getItem(key)) window.localStorage.setItem(key, value);
    },
    { key: STORAGE_KEY, value: JSON.stringify(state) },
  );
}

export const cardIds = (page: Page) =>
  page.getByTestId("content-card").evaluateAll((cards) => cards.map((c) => c.getAttribute("data-id")));

export const test = base;
export { expect };
