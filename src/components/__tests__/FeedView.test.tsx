import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FeedPage } from "@/lib/types";
import { FeedView } from "@/components/views/FeedView";
import { liveItemReceived } from "@/store/slices/feedSlice";
import { initialPreferences } from "@/store/slices/preferencesSlice";
import { makeItem, renderWithProviders, testUser } from "@/test/utils";

// Integration test: real Redux store, real components; only the network hook is mocked.
const mockUseFeed = jest.fn();
jest.mock("@/store/api/contentApi", () => {
  const actual = jest.requireActual("@/store/api/contentApi");
  return { ...actual, useGetFeedInfiniteQuery: (...args: unknown[]) => mockUseFeed(...args) };
});

const page = (items: FeedPage["items"], hasMore = false): FeedPage => ({
  items,
  page: 1,
  hasMore,
  origins: { news: "mock", movie: "mock", social: "mock" },
});

function feedState(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    ...overrides,
  };
}

const preloadedState = { auth: { user: testUser }, preferences: { ...initialPreferences, categories: ["technology" as const, "sports" as const] } };

describe("FeedView (integration)", () => {
  beforeEach(() => mockUseFeed.mockReset());

  it("requests the feed for the user's categories and renders a personalised greeting", () => {
    mockUseFeed.mockReturnValue(feedState({ data: { pages: [page([makeItem({ title: "Hello" })])] } }));
    renderWithProviders(<FeedView />, { preloadedState });
    expect(mockUseFeed).toHaveBeenCalledWith(["technology", "sports"]);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Test");
    expect(screen.getByText("Demo data")).toBeInTheDocument();
  });

  it("renders all fetched pages as cards", () => {
    mockUseFeed.mockReturnValue(
      feedState({ data: { pages: [page([makeItem({ id: "1", title: "One" })]), page([makeItem({ id: "2", title: "Two" })])] } }),
    );
    renderWithProviders(<FeedView />, { preloadedState });
    expect(screen.getAllByTestId("content-card")).toHaveLength(2);
    expect(screen.getByText("You're all caught up ✨")).toBeInTheDocument();
  });

  it("shows loading skeletons, then errors with retry", async () => {
    mockUseFeed.mockReturnValue(feedState({ isLoading: true }));
    const { rerender } = renderWithProviders(<FeedView />, { preloadedState });
    expect(screen.getAllByTestId("card-skeleton").length).toBeGreaterThan(0);

    const refetch = jest.fn();
    mockUseFeed.mockReturnValue(feedState({ isError: true, refetch }));
    rerender(<FeedView />);
    await userEvent.setup().click(screen.getByRole("button", { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it("shows the empty state when the API returns no content", () => {
    mockUseFeed.mockReturnValue(feedState({ data: { pages: [page([])] } }));
    renderWithProviders(<FeedView />, { preloadedState });
    expect(screen.getByRole("heading", { name: /nothing here yet/i })).toBeInTheDocument();
  });

  it("filters by content type via the tabs", async () => {
    mockUseFeed.mockReturnValue(
      feedState({
        data: { pages: [page([makeItem({ id: "n", title: "A news story" }), makeItem({ id: "m", type: "movie", title: "A movie" })])] },
      }),
    );
    renderWithProviders(<FeedView />, { preloadedState });
    const tabs = screen.getByRole("group", { name: /filter by content type/i });
    await userEvent.setup().click(within(tabs).getByRole("button", { name: /movies/i }));
    expect(screen.getAllByTestId("content-card")).toHaveLength(1);
    expect(screen.getByText("A movie")).toBeInTheDocument();
  });

  it("offers a 'Load more' fallback that fetches the next page", async () => {
    const fetchNextPage = jest.fn();
    mockUseFeed.mockReturnValue(feedState({ data: { pages: [page([makeItem()], true)] }, hasNextPage: true, fetchNextPage }));
    renderWithProviders(<FeedView />, { preloadedState });
    await userEvent.setup().click(screen.getByRole("button", { name: /load more/i }));
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it("surfaces real-time posts behind a 'new posts' pill", async () => {
    mockUseFeed.mockReturnValue(feedState({ data: { pages: [page([makeItem({ id: "base" })])] } }));
    const { store } = renderWithProviders(<FeedView />, { preloadedState });
    act(() => {
      store.dispatch(liveItemReceived(makeItem({ id: "live-1", type: "social", url: null, description: "Fresh!", meta: { author: "Live Author", handle: "live" } })));
    });
    const pill = await screen.findByTestId("new-posts");
    expect(pill).toHaveTextContent("1 new post");
    await userEvent.setup().click(pill);
    expect(screen.getByText("Fresh!")).toBeInTheDocument();
    expect(screen.getAllByTestId("content-card")[0]).toHaveAttribute("data-id", "live-1");
  });
});
