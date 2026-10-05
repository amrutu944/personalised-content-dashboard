import { makeStore } from "@/store";
import { hydrate, resetApp } from "@/store/actions";
import { login, loginAsGuest, logout, updateProfile } from "@/store/slices/authSlice";
import { clearFavorites, removeFavorite, setFavoritesOrder, toggleFavorite } from "@/store/slices/favoritesSlice";
import {
  MAX_PENDING_LIVE,
  liveItemReceived,
  revealLive,
  setCategoryFilter,
  setFeedOrder,
} from "@/store/slices/feedSlice";
import {
  initialPreferences,
  sanitizePreferences,
  setLanguage,
  setTheme,
  toggleCategory,
} from "@/store/slices/preferencesSlice";
import { makeItem } from "@/test/utils";

describe("preferences slice", () => {
  it("toggles categories on and off, keeping canonical order", () => {
    const store = makeStore();
    store.dispatch(toggleCategory("health"));
    store.dispatch(toggleCategory("entertainment"));
    expect(store.getState().preferences.categories).toEqual(["technology", "business", "sports", "entertainment", "health"]);
    store.dispatch(toggleCategory("business"));
    expect(store.getState().preferences.categories).not.toContain("business");
  });

  it("never allows removing the last category", () => {
    const store = makeStore({ preferences: { ...initialPreferences, categories: ["science"] } });
    store.dispatch(toggleCategory("science"));
    expect(store.getState().preferences.categories).toEqual(["science"]);
  });

  it("updates theme and language", () => {
    const store = makeStore();
    store.dispatch(setTheme("light"));
    store.dispatch(setLanguage("hi"));
    expect(store.getState().preferences).toMatchObject({ theme: "light", language: "hi" });
  });

  it("sanitizes corrupted persisted data", () => {
    expect(
      sanitizePreferences({ categories: ["nope", "sports"] as never, theme: "neon" as never, language: "xx" as never, liveUpdates: "yes" as never }),
    ).toEqual({ categories: ["sports"], theme: "dark", language: "en", liveUpdates: true });
  });

  it("hydrates from storage and marks the app hydrated", () => {
    const store = makeStore();
    expect(store.getState().ui.hydrated).toBe(false);
    store.dispatch(hydrate({ preferences: { ...initialPreferences, theme: "light", categories: ["health"] } }));
    expect(store.getState().preferences.theme).toBe("light");
    expect(store.getState().preferences.categories).toEqual(["health"]);
    expect(store.getState().ui.hydrated).toBe(true);
  });
});

describe("favorites slice", () => {
  const a = makeItem({ id: "a" });
  const b = makeItem({ id: "b" });
  const c = makeItem({ id: "c" });

  it("adds new favorites to the top and removes on second toggle", () => {
    const store = makeStore();
    store.dispatch(toggleFavorite(a));
    store.dispatch(toggleFavorite(b));
    expect(store.getState().favorites.items.map((i) => i.id)).toEqual(["b", "a"]);
    store.dispatch(toggleFavorite(a));
    expect(store.getState().favorites.items.map((i) => i.id)).toEqual(["b"]);
  });

  it("reorders, removes and clears", () => {
    const store = makeStore({ favorites: { items: [a, b, c] } });
    store.dispatch(setFavoritesOrder(["c", "a", "b"]));
    expect(store.getState().favorites.items.map((i) => i.id)).toEqual(["c", "a", "b"]);
    store.dispatch(removeFavorite("a"));
    expect(store.getState().favorites.items.map((i) => i.id)).toEqual(["c", "b"]);
    store.dispatch(clearFavorites());
    expect(store.getState().favorites.items).toEqual([]);
  });

  it("drops invalid items when hydrating", () => {
    const store = makeStore();
    store.dispatch(hydrate({ favorites: { items: [a, { foo: 1 } as never, null as never] } }));
    expect(store.getState().favorites.items).toEqual([a]);
  });
});

describe("feed slice", () => {
  it("queues live posts without duplicates and caps the queue", () => {
    const store = makeStore();
    const post = makeItem({ id: "live-1", type: "social" });
    store.dispatch(liveItemReceived(post));
    store.dispatch(liveItemReceived(post));
    expect(store.getState().feed.pendingLive).toHaveLength(1);
    for (let i = 0; i < MAX_PENDING_LIVE + 5; i++) store.dispatch(liveItemReceived(makeItem({ id: `x${i}` })));
    expect(store.getState().feed.pendingLive).toHaveLength(MAX_PENDING_LIVE);
  });

  it("reveals pending posts into the feed", () => {
    const store = makeStore();
    store.dispatch(liveItemReceived(makeItem({ id: "p1" })));
    store.dispatch(revealLive());
    expect(store.getState().feed.pendingLive).toEqual([]);
    expect(store.getState().feed.live.map((i) => i.id)).toEqual(["p1"]);
  });

  it("resets custom order and topic filter when preferences change", () => {
    const store = makeStore();
    store.dispatch(setFeedOrder(["b", "a"]));
    store.dispatch(setCategoryFilter("sports"));
    store.dispatch(toggleCategory("health"));
    expect(store.getState().feed.order).toEqual([]);
    expect(store.getState().feed.categoryFilter).toBe("all");
  });
});

describe("auth slice", () => {
  it("logs in with a normalized profile and logs out", () => {
    const store = makeStore();
    store.dispatch(login({ name: "  Amruth  ", email: " A@B.COM " }));
    expect(store.getState().auth.user).toMatchObject({ name: "Amruth", email: "a@b.com", isGuest: false });
    store.dispatch(logout());
    expect(store.getState().auth.user).toBeNull();
  });

  it("supports guest mode and profile updates with limits", () => {
    const store = makeStore();
    store.dispatch(loginAsGuest());
    store.dispatch(updateProfile({ name: "   ", bio: "x".repeat(500), avatarColor: "rose" }));
    const user = store.getState().auth.user!;
    expect(user.name).toBe("Guest"); // blank names are ignored
    expect(user.bio).toHaveLength(160);
    expect(user.avatarColor).toBe("rose");
  });

  it("resetApp clears everything", () => {
    const store = makeStore();
    store.dispatch(loginAsGuest());
    store.dispatch(toggleFavorite(makeItem()));
    store.dispatch(resetApp());
    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().favorites.items).toEqual([]);
  });
});
