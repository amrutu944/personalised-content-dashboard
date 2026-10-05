import { expect, signIn, test } from "./fixtures";

test.describe("Preferences & personalization", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.goto("/");
    await expect(page.getByTestId("content-card").first()).toBeVisible();
  });

  test("dark mode toggle persists across reloads", async ({ page }) => {
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
    await page.getByTestId("theme-toggle").click();
    await expect(html).not.toHaveClass(/dark/);
    await page.reload();
    await expect(html).not.toHaveClass(/dark/);
  });

  test("switches language (i18n)", async ({ page }) => {
    await page.getByTestId("language-select").selectOption("hi");
    await expect(page.getByTestId("nav-feed")).toHaveText(/मेरी फ़ीड/);
    await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  });

  test("changing categories updates the feed", async ({ page }) => {
    await page.getByTestId("nav-settings").click();
    await page.getByTestId("category-health").click();
    await expect(page.getByTestId("category-health")).toHaveAttribute("aria-pressed", "true");
    await page.getByTestId("nav-feed").click();
    await expect(page.getByText("Your personalized briefing across 4 topics")).toBeVisible();
    await expect(page.getByRole("group", { name: "Filter by topic" }).getByRole("button", { name: "Health" })).toBeVisible();
  });

  test("filters the feed by content type", async ({ page }) => {
    await page.getByRole("group", { name: "Filter by content type" }).getByRole("button", { name: /Movies/ }).click();
    const cards = page.getByTestId("content-card");
    await expect(cards.first()).toBeVisible();
    for (const text of await cards.evaluateAll((els) => els.map((e) => e.textContent ?? ""))) {
      expect(text).toMatch(/Play now/);
    }
  });
});
