import { act, screen } from "@testing-library/react";
import { SearchView, SEARCH_DEBOUNCE_MS } from "@/components/views/SearchView";
import { setSearchQuery } from "@/store/slices/uiSlice";
import { makeItem, renderWithProviders } from "@/test/utils";

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  usePathname: () => "/search",
  useSearchParams: () => new URLSearchParams(),
}));

const mockUseSearch = jest.fn();
jest.mock("@/store/api/contentApi", () => {
  const actual = jest.requireActual("@/store/api/contentApi");
  return { ...actual, useSearchQuery: (...args: unknown[]) => mockUseSearch(...args) };
});

describe("SearchView (debounced search)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockUseSearch.mockReset().mockReturnValue({ data: undefined, isFetching: false, isError: false, refetch: jest.fn() });
  });
  afterEach(() => jest.useRealTimers());

  /** The query args the component asked RTK Query to actually fetch (not skipped). */
  const fetchedQueries = () => mockUseSearch.mock.calls.filter(([, opts]) => !opts?.skip).map(([q]) => q);

  it("shows the idle state with suggestions before typing", () => {
    renderWithProviders(<SearchView />);
    expect(screen.getByRole("heading", { name: /search everything/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "cricket" })).toBeInTheDocument();
  });

  it("waits for the user to stop typing before querying the API", () => {
    const { store } = renderWithProviders(<SearchView />);
    for (const partial of ["c", "cr", "cri", "cric"]) {
      act(() => {
        store.dispatch(setSearchQuery(partial));
        jest.advanceTimersByTime(100);
      });
    }
    expect(fetchedQueries()).toEqual([]); // nothing fetched mid-typing

    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(fetchedQueries()).toEqual(expect.arrayContaining(["cric"]));
    expect(fetchedQueries()).not.toContain("cr");
    expect(mockReplace).toHaveBeenLastCalledWith("/search?q=cric", { scroll: false });
  });

  it("renders results for the debounced query", () => {
    mockUseSearch.mockReturnValue({ data: { query: "dune", items: [makeItem({ title: "Dune review" })], origins: { news: "mock", movie: "mock", social: "mock" } }, isFetching: false, isError: false, refetch: jest.fn() });
    const { store } = renderWithProviders(<SearchView />);
    act(() => {
      store.dispatch(setSearchQuery("dune"));
    });
    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(screen.getByRole("heading", { name: /results for “dune”/i })).toBeInTheDocument();
    expect(screen.getByText("Dune review")).toBeInTheDocument();
  });

  it("shows a helpful empty state when nothing matches", () => {
    mockUseSearch.mockReturnValue({ data: { query: "zzzz", items: [], origins: { news: "mock", movie: "mock", social: "mock" } }, isFetching: false, isError: false, refetch: jest.fn() });
    const { store } = renderWithProviders(<SearchView />);
    act(() => {
      store.dispatch(setSearchQuery("zzzz"));
    });
    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(screen.getByRole("heading", { name: /no results for “zzzz”/i })).toBeInTheDocument();
  });

  it("asks for at least 2 characters", () => {
    const { store } = renderWithProviders(<SearchView />);
    act(() => {
      store.dispatch(setSearchQuery("a"));
    });
    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(screen.getByRole("heading", { name: /at least 2 characters/i })).toBeInTheDocument();
    expect(fetchedQueries()).toEqual([]);
  });
});
