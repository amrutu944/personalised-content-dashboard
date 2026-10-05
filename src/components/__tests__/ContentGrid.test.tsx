import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContentGrid } from "@/components/feed/ContentGrid";
import { makeItem, renderWithProviders } from "@/test/utils";

const empty = { title: "Nothing here", description: "Add more topics" };

describe("ContentGrid states", () => {
  it("shows skeletons while loading", () => {
    renderWithProviders(<ContentGrid items={[]} isLoading empty={empty} />);
    expect(screen.getAllByTestId("card-skeleton").length).toBeGreaterThan(0);
  });

  it("shows an error with a working retry button", async () => {
    const onRetry = jest.fn();
    renderWithProviders(<ContentGrid items={[]} isError onRetry={onRetry} empty={empty} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/something went wrong/i);
    await userEvent.setup().click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows the empty state when there is no content", () => {
    renderWithProviders(<ContentGrid items={[]} empty={empty} />);
    expect(screen.getByRole("heading", { name: "Nothing here" })).toBeInTheDocument();
    expect(screen.getByText("Add more topics")).toBeInTheDocument();
  });

  it("keeps showing existing items if a later request errors", () => {
    renderWithProviders(<ContentGrid items={[makeItem()]} isError empty={empty} />);
    expect(screen.getAllByTestId("content-card")).toHaveLength(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders sortable cards with keyboard-accessible drag handles", () => {
    const items = [makeItem({ id: "a", title: "A" }), makeItem({ id: "b", title: "B" })];
    renderWithProviders(<ContentGrid items={items} empty={empty} onReorder={jest.fn()} />);
    const handles = screen.getAllByTestId("drag-handle");
    expect(handles).toHaveLength(2);
    expect(handles[0]).toHaveAttribute("aria-label", "Drag to reorder");
    expect(handles[0]).toHaveAttribute("aria-roledescription", "sortable");
  });
});
