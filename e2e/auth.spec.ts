import { expect, test } from "./fixtures";

test.describe("Authentication", () => {
  test("redirects guests to login, validates, signs in and out", async ({ page }) => {
    await page.goto("/favorites");
    await expect(page).toHaveURL(/\/login\?next=%2Ffavorites/);

    // Validation
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByTestId("login-form").getByRole("alert")).toHaveCount(3);

    // Sign in -> returns to the originally requested page
    await page.getByLabel("Full name").fill("Amruth Gowda");
    await page.getByLabel("Email address").fill("amruth@example.com");
    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/favorites$/);
    await expect(page.getByRole("heading", { name: "Favorites", level: 1 })).toBeVisible();

    // Session survives a reload
    await page.reload();
    await expect(page.getByRole("heading", { name: "Favorites", level: 1 })).toBeVisible();

    // Sign out
    await page.getByTestId("user-menu").click();
    await page.getByTestId("logout").click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("guest access goes straight to the personalized feed", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("guest-login").click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Guest");
    await expect(page.getByTestId("content-card").first()).toBeVisible();
  });
});
