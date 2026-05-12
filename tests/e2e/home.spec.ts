import { expect, test, type Page } from "@playwright/test";

test("prepares the Start Here intake payload", async ({ page }) => {
  await page.goto("/");
  await expectNoHorizontalOverflow(page);
  await expectNoPageScroll(page);

  await expect(
    page.getByRole("heading", {
      name: /begin your global journey/i,
    })
  ).toBeVisible();

  await page.getByLabel(/first name/i).fill("Taylor");
  await page.getByLabel(/last name/i).fill("Rivera");
  await page.getByLabel(/email/i).fill("taylor@example.com");
  await page.getByLabel(/whatsapp/i).fill("+1 555 0100");
  await page.getByRole("button", { name: /warm referral/i }).click();
  await page.getByRole("button", { name: /continue/i }).click();
  await expectNoHorizontalOverflow(page);
  await expectNoPageScroll(page);

  await page
    .getByRole("button", { name: /yes - knows structure or bank need/i })
    .click();
  await page.getByRole("button", { name: /new bank account/i }).click();
  await page.getByRole("button", { name: /continue/i }).click();
  await expectNoHorizontalOverflow(page);
  await expectNoPageScroll(page);

  await page.getByRole("button", { name: /partially set up/i }).click();
  await page.getByLabel(/currently a resident/i).fill("Argentina");
  await page
    .getByLabel(/passport\(s\) \/ citizenship\(s\)/i)
    .fill("United States");
  await page.getByRole("button", { name: /continue/i }).click();
  await expectNoHorizontalOverflow(page);
  await expectNoPageScroll(page);

  await page.getByRole("button", { name: "Yes" }).first().click();
  await page.getByRole("button", { name: /\$25k-\$100k\/month/i }).click();
  await page.getByRole("button", { name: /\$1M-\$5M/i }).click();
  await page.getByRole("button", { name: /ASAP \/ 0-3 months/i }).click();
  await page
    .getByRole("button", { name: /maybe, if the fit is clear/i })
    .click();
  await page.getByRole("button", { name: /continue/i }).click();
  await expectNoHorizontalOverflow(page);
  await expectNoPageScroll(page);

  const prepareSubmission = page.getByRole("button", {
    name: /prepare submission/i,
  });
  const submissionPrepared = page.getByText(/submission prepared/i);

  await expect(prepareSubmission.or(submissionPrepared)).toBeVisible();

  if (await prepareSubmission.isVisible()) {
    await prepareSubmission.click();
  }

  await expect(
    page.getByRole("heading", {
      name: /intake is ready for redomiciled review/i,
    })
  ).toBeVisible();
  await expect(page.getByText(/PLACEHOLDER_CLICKUP_CRM_LIST_ID/)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;

    return root.scrollWidth - root.clientWidth;
  });

  expect(overflow).toBeLessThanOrEqual(1);
}

async function expectNoPageScroll(page: Page) {
  const verticalOverflow = await page.evaluate(() => {
    const root = document.documentElement;

    return root.scrollHeight - root.clientHeight;
  });

  expect(verticalOverflow).toBeLessThanOrEqual(1);
}
