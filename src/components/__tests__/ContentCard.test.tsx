import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContentCard } from "@/components/cards/ContentCard";
import { makeItem, renderWithProviders } from "@/test/utils";

describe("ContentCard", () => {
  it("renders a news article with a safe external 'Read more' link", () => {
    renderWithProviders(<ContentCard item={makeItem({ title: "AI breakthrough", source: "Wire" })} />);
    expect(screen.getByRole("heading", { name: "AI breakthrough" })).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /read more/i });
    expect(link).toHaveAttribute("href", "https://example.com/article");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.getByText("Wire")).toBeInTheDocument();
  });

  it("shows 'Play now' and an accessible rating for movies", () => {
    renderWithProviders(<ContentCard item={makeItem({ type: "movie", title: "Dune", meta: { rating: 8.1 } })} />);
    expect(screen.getByRole("link", { name: /play now/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Rating 8.1 out of 10")).toBeInTheDocument();
  });

  it("renders social posts with author, handle and hashtags", () => {
    renderWithProviders(
      <ContentCard
        item={makeItem({ type: "social", url: null, description: "Hello world", meta: { author: "Priya", handle: "priya", hashtags: ["webdev"], likes: 1200 } })}
      />,
    );
    expect(screen.getByText("Priya")).toBeInTheDocument();
    expect(screen.getByText(/@priya/)).toBeInTheDocument();
    expect(screen.getByText("#webdev")).toBeInTheDocument();
    expect(screen.getByText("1.2K")).toBeInTheDocument();
  });

  it("toggles favorites in the Redux store with correct aria-pressed state", async () => {
    const user = userEvent.setup();
    const item = makeItem({ id: "fav-me" });
    const { store } = renderWithProviders(<ContentCard item={item} />);

    const button = screen.getByRole("button", { name: /add to favorites/i });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(button);
    expect(store.getState().favorites.items.map((i) => i.id)).toEqual(["fav-me"]);
    expect(screen.getByRole("button", { name: /remove from favorites/i })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /remove from favorites/i }));
    expect(store.getState().favorites.items).toEqual([]);
  });

  it("opens an accessible preview dialog for items without a URL", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContentCard item={makeItem({ url: null, title: "Offline story" })} />);
    await user.click(screen.getByRole("button", { name: /read more: offline story/i }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    await user.keyboard("{Escape}");
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog")); // waits for exit animation
  });

  it("falls back to a placeholder when there is no image", () => {
    const { container } = renderWithProviders(<ContentCard item={makeItem({ image: null })} />);
    expect(container.querySelector("img")).toBeNull();
  });
});
