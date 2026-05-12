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

  await page.getByRole("button", { name: /continue/i }).click();
  await expect(
    page.getByText(/please complete the highlighted fields/i)
  ).toBeVisible();
  await expect(page.getByText(/first name is required/i)).toBeVisible();
  await expect(page.getByLabel(/first name/i)).toHaveAttribute(
    "aria-invalid",
    "true"
  );
  await expect(
    page.getByRole("button", { name: /commercial readiness/i })
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: /choose view/i })).toHaveCount(
    0
  );

  await page.getByLabel(/first name/i).fill("Taylor");
  await page.getByLabel(/last name/i).fill("Rivera");
  await page.getByLabel(/email/i).fill("taylor@example.com");
  await page.getByLabel(/phone/i).fill("+1 555 0100");
  await expect(page.getByText(/where are you coming from/i)).toHaveCount(0);
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(
    page.getByRole("button", { name: /contact info/i })
  ).toBeEnabled();
  await expectNoHorizontalOverflow(page);
  await expectNoPageScroll(page);

  await page
    .getByRole("radio", { name: /yes .* structure .* bank account/i })
    .click();
  await page.getByRole("checkbox", { name: /new bank account/i }).click();
  await page.getByRole("button", { name: /continue/i }).click();
  await expectNoHorizontalOverflow(page);
  await expectNoPageScroll(page);

  await page.getByRole("radio", { name: /partially set up/i }).click();
  await page.getByLabel(/currently a resident/i).fill("Argentina");
  await page
    .getByLabel(/passport\(s\) \/ citizenship\(s\)/i)
    .fill("United States");
  await page.getByRole("button", { name: /continue/i }).click();
  await expectNoHorizontalOverflow(page);
  await expectNoPageScroll(page);

  await page.getByRole("radio", { name: "Yes" }).first().click();
  await page.getByRole("radio", { name: /\$25k.*\$100k.*month/i }).click();
  await page.getByRole("radio", { name: /\$1M.*\$5M/i }).click();
  await page.getByRole("radio", { name: /ASAP \/ 0.*3 months/i }).click();
  await page
    .getByRole("radio", { name: /maybe, if the fit is clear/i })
    .click();
  await page.getByRole("button", { name: /complete/i }).click();
  await expect(
    page.getByRole("dialog", { name: /confirm the intake/i })
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectNoPageScroll(page);

  const prepareSubmission = page.getByRole("button", {
    name: /confirm and continue/i,
  });
  const submissionPrepared = page.getByText(/submission prepared/i);

  await expect(prepareSubmission.or(submissionPrepared)).toBeVisible();

  if (await prepareSubmission.isVisible()) {
    await prepareSubmission.click();
  }

  await expect(
    page.getByRole("heading", {
      name: /ready to book/i,
    })
  ).toBeVisible();
  await expect(page.getByText(/cal.com calendar pending/i)).toBeVisible();
  await expect(page.getByText(/PLACEHOLDER_CLICKUP_CRM_LIST_ID/)).toHaveCount(
    0
  );
  await expectNoHorizontalOverflow(page);
});

test("admin preset routes booked banking leads to Will calendar", async ({
  page,
}) => {
  await submitAdminPreset(page, /booked call - banking/i);

  await expect(
    page.getByRole("heading", { name: /ready to book/i })
  ).toBeVisible();
  await expect(page.getByText(/cal.com calendar pending/i)).toBeVisible();
  await expect(page.getByText("Booked Call", { exact: true })).toBeVisible();
  await expect(page.getByText("Will", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("admin preset routes booked non-banking leads to Erik calendar", async ({
  page,
}) => {
  await submitAdminPreset(page, /booked call - non-banking/i);

  await expect(
    page.getByRole("heading", { name: /ready to book/i })
  ).toBeVisible();
  await expect(page.getByText(/cal.com calendar pending/i)).toBeVisible();
  await expect(page.getByText("Booked Call", { exact: true })).toBeVisible();
  await expect(page.getByText("Erik", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("admin preset routes manual triage without showing a calendar", async ({
  page,
}) => {
  await submitAdminPreset(page, /manual triage/i);

  await expect(
    page.getByRole("heading", { name: /ready for redomiciled review/i })
  ).toBeVisible();
  await expect(page.getByText("Manual Triage", { exact: true })).toBeVisible();
  await expect(page.getByText(/cal.com calendar pending/i)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("admin preset routes unqualified leads to the disqualification screen", async ({
  page,
}) => {
  await submitAdminPreset(page, /^unqualified$/i);

  await expect(
    page.getByRole("heading", {
      name: /free redomiciled community/i,
    })
  ).toBeVisible();
  await expect(
    page.getByText("Unqualified / Not Ready", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText("No calendar is shown for this route.", { exact: true })
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("admin preset routes warm low-fit leads to manual triage", async ({
  page,
}) => {
  await submitAdminPreset(page, /warm referral/i);

  await expect(
    page.getByRole("heading", { name: /ready for redomiciled review/i })
  ).toBeVisible();
  await expect(page.getByText("Manual Triage", { exact: true })).toBeVisible();
  await expect(page.getByText(/submission received/i)).toBeVisible();
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

async function submitAdminPreset(page: Page, presetName: RegExp) {
  await page.goto("/?admin=1");
  await page.getByRole("button", { name: /choose view/i }).click();
  await expect(
    page.getByRole("dialog", { name: /admin preview/i })
  ).toBeVisible();
  await page.getByRole("button", { name: presetName }).click();
  await page.getByRole("button", { name: /complete/i }).click();
  await expect(
    page.getByRole("dialog", { name: /confirm the intake/i })
  ).toBeVisible();
  await page.getByRole("button", { name: /confirm and continue/i }).click();
}
