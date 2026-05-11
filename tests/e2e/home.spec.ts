import { expect, test } from "@playwright/test";

test("loads the initial app shell", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /start here/i,
    })
  ).toBeVisible();
});
