import "@testing-library/jest-dom";
import "@/i18n";

// jsdom doesn't implement these browser APIs; provide light stubs.
if (typeof window !== "undefined") {
  window.matchMedia ??= ((query: string) => ({
    matches: query.includes("dark"),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  window.scrollTo = () => {};
}
