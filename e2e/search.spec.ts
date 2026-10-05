import { expect, signIn, test } from "./fixtures";

test.describe("Search", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.goto("/");
    await expect(page.getByTestId("content-card").first()).toBeVisible();
  });

  test("debounced search across news, movies and social posts", async ({ page }) => {
    const searchRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/search")) searchRequests.push(req.url());
    });

    await page.getByTestId("search-input").pressSequentially("cricket", { delay: 40 });
    await expect(page).toHaveURL(/\/search\?q=cricket/);
    await expect(page.getByRole("heading", { name: /results for “cricket”/i })).toBeVisible();

    const results = page.getByTestId("search-results");
    await expect(results.getByText("Lagaan")).toBeVisible();
    await expect(results.getByText(/cricket league signs record broadcast deal/)).toBeVisible();

    // Debounce: typing 7 characters should trigger a single API request.
    expect(searchRequests).toHaveLength(1);
  });

  test("shows an empty state for no matches and supports deep links", async ({ page }) => {
    await page.goto("/search?q=zzqqxx");
    await expect(page.getByRole("heading", { name: /no results for “zzqqxx”/i })).toBeVisible();
    await expect(page.getByTestId("search-input")).toHaveValue("zzqqxx");
  });
});
