import { makeStore } from "@/store";
import { hydrate } from "@/store/actions";
import { STORAGE_KEY, loadPersistedState } from "@/store/persistence";
import { setTheme } from "@/store/slices/preferencesSlice";

describe("localStorage persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it("does not write before hydration (would overwrite saved data)", () => {
    const store = makeStore();
    store.dispatch(setTheme("light"));
    jest.runAllTimers();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("writes whitelisted slices (debounced) after hydration", () => {
    const store = makeStore();
    store.dispatch(hydrate({}));
    store.dispatch(setTheme("light"));
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull(); // debounced
    jest.runAllTimers();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.preferences.theme).toBe("light");
    expect(saved).not.toHaveProperty("contentApi");
    expect(saved).not.toHaveProperty("ui");
  });

  it("flushes a pending save immediately when the page is hidden (tab close / reload)", () => {
    const store = makeStore();
    store.dispatch(hydrate({}));
    store.dispatch(setTheme("light"));
    window.dispatchEvent(new Event("pagehide"));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).preferences.theme).toBe("light");
  });

  it("round-trips through loadPersistedState", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ preferences: { theme: "light" } }));
    expect(loadPersistedState()).toEqual({ preferences: { theme: "light" } });
  });

  it("survives corrupted JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadPersistedState()).toEqual({});
  });
});
