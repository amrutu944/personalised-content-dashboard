import type { Page } from "@playwright/test";
import { cardIds, expect, signIn, test } from "./fixtures";

/** dnd-kit keyboard sensor: Space lifts, arrows move, Space drops. */
async function keyboardMoveRight(page: Page) {
  await page.waitForTimeout(600); // let entrance animations settle so dnd-kit measures final positions
  await page.getByTestId("drag-handle").first().focus();
  await page.keyboard.press("Space");
  await page.waitForTimeout(300);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(300);
  await page.keyboard.press("Space");
}

test.describe("Drag-and-drop reordering", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.goto("/");
    await expect(page.getByTestId("content-card").nth(3)).toBeVisible();
  });

  test("reorders feed cards with the mouse", async ({ page }) => {
    const before = await cardIds(page);
    const handle = page.getByTestId("drag-handle").first();
    const target = page.getByTestId("content-card").nth(1);

    await page.getByTestId("content-card").first().hover();
    const from = (await handle.boundingBox())!;
    const to = (await target.boundingBox())!;
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 20 });
    await page.mouse.move(to.x + to.width / 2 + 5, to.y + to.height / 2, { steps: 5 });
    await page.mouse.up();

    await expect.poll(() => cardIds(page)).toEqual([before[1], before[0], ...before.slice(2)]);
    await expect(page.getByRole("button", { name: "Reset order" })).toBeVisible();
  });

  test("reorders feed cards with the keyboard (accessible DnD)", async ({ page }) => {
    const before = await cardIds(page);
    await keyboardMoveRight(page);

    await expect.poll(() => cardIds(page)).toEqual([before[1], before[0], ...before.slice(2)]);

    await page.getByRole("button", { name: "Reset order" }).click();
    await expect.poll(() => cardIds(page)).toEqual(before);
  });

  test("favorites order persists across reloads", async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.getByTestId("content-card").nth(i).getByRole("button", { name: "Add to favorites" }).click();
    }
    await page.getByTestId("nav-favorites").click();
    await expect(page.getByTestId("content-card")).toHaveCount(3);
    const before = await cardIds(page);

    await keyboardMoveRight(page);
    const expected = [before[1], before[0], before[2]];
    await expect.poll(() => cardIds(page)).toEqual(expected);

    await page.reload();
    await expect(page.getByTestId("content-card")).toHaveCount(3);
    expect(await cardIds(page)).toEqual(expected);
  });
});
