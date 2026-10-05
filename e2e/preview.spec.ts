import { expect, signIn, test } from "./fixtures";

test.describe("Preview dialog", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.goto("/");
    await expect(page.getByTestId("content-card").first()).toBeVisible();
  });

  test("opens centered over the page, stays still and closes", async ({ page }) => {
    const viewport = page.viewportSize()!;
    await page.getByRole("button", { name: /View post/ }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(600); // opening animation

    // Regression: the dialog used to be trapped inside the hovered card and jitter.
    const before = (await dialog.boundingBox())!;
    expect(Math.abs(before.x + before.width / 2 - viewport.width / 2)).toBeLessThan(40);
    await page.mouse.move(50, 50, { steps: 5 });
    await page.mouse.move(viewport.width - 50, viewport.height - 50, { steps: 5 });
    const after = (await dialog.boundingBox())!;
    expect(after.x).toBeCloseTo(before.x, 0);
    expect(after.y).toBeCloseTo(before.y, 0);

    // Buttons inside the dialog work
    await dialog.getByRole("button", { name: "Add to favorites" }).click();
    await expect(dialog.getByRole("button", { name: "Remove from favorites" })).toBeVisible();

    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toHaveCount(0);

    // Escape also closes it
    await page.getByRole("button", { name: /View post/ }).first().click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });
});
