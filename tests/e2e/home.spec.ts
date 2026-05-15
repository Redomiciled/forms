import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

const CLICKUP_API_BASE_URL = "https://api.clickup.com/api/v2";
const e2eCreatedTaskIds = new WeakMap<Page, Set<string>>();
const e2eResponseTrackers = new WeakMap<Page, Array<Promise<void>>>();

test.beforeEach(async ({ page }) => {
  const createdTaskIds = new Set<string>();
  const responseTrackers: Array<Promise<void>> = [];

  e2eCreatedTaskIds.set(page, createdTaskIds);
  e2eResponseTrackers.set(page, responseTrackers);

  page.on("response", (response) => {
    if (
      !response.url().includes("/api/start-here/submissions") ||
      response.request().method() !== "POST"
    ) {
      return;
    }

    responseTrackers.push(
      response
        .json()
        .then((body: unknown) => {
          const taskId = getSubmissionTaskId(body);

          if (taskId) {
            createdTaskIds.add(taskId);
          }
        })
        .catch(() => {
          // Failed submissions are asserted by the test itself.
        })
    );
  });
});

test.afterEach(async ({ page, request }) => {
  await Promise.allSettled(e2eResponseTrackers.get(page) ?? []);
  await deleteE2eClickUpTasks(request, [
    ...(e2eCreatedTaskIds.get(page) ?? []),
  ]);
});

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

  await page.getByLabel(/first name/i).fill("TEST Taylor");
  await page.getByLabel(/last name/i).fill("Rivera");
  await page
    .getByLabel(/email/i)
    .fill(`qa-start-here-e2e-${Date.now()}@example.com`);
  await page.getByLabel(/country calling code/i).fill("+54");
  await page.getByLabel(/phone number/i).fill("11 1234 5678");
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
  await page.getByLabel(/currently a resident.*search/i).fill("Arg");
  await expect(page.getByRole("button", { name: /Argentina/i })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /United States/i })
  ).toHaveCount(0);
  await page.getByRole("button", { name: /Argentina/i }).click();
  await expect(
    page.getByRole("button", { name: /add a new country/i })
  ).toHaveCount(0);
  await expect(page.getByText(/start typing to find a country/i)).toHaveCount(
    0
  );
  await expect(
    page.getByRole("button", { name: /United States/i })
  ).toHaveCount(0);
  await page.getByLabel(/passport.*citizenship.*search/i).fill("United");
  await page.getByRole("button", { name: /United States/i }).click();
  await page.getByRole("button", { name: /continue/i }).click();
  await expectNoHorizontalOverflow(page);
  await expectNoPageScroll(page);

  await page.getByRole("button", { name: /step 2.*what path/i }).click();
  await expect(
    page.getByRole("heading", { name: /what path are you exploring/i })
  ).toBeVisible();
  await page
    .getByRole("button", { name: /step 4.*commercial readiness/i })
    .click();
  await expect(
    page.getByRole("heading", { name: /commercial readiness/i })
  ).toBeVisible();

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
  await expect(page.locator("dl").filter({ hasText: "Phone" })).toContainText(
    /\+54 11 ?1234 ?5678/
  );
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
      name: /book a call with us/i,
    })
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: /booking calendar/i })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /edit answers/i })).toHaveCount(
    0
  );
  await expect(page.getByText(/choose a time with/i)).toHaveCount(0);
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
    page.getByRole("heading", { name: /book a call with us/i })
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: /booking calendar/i })
  ).toBeVisible();
  await expect(page.getByText("Booked Call", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Will", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /edit answers/i })).toHaveCount(
    0
  );
  await expectNoHorizontalOverflow(page);
});

test("admin preset routes booked non-banking leads to Erik calendar", async ({
  page,
}) => {
  await submitAdminPreset(page, /booked call - non-banking/i);

  await expect(
    page.getByRole("heading", { name: /book a call with us/i })
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: /booking calendar/i })
  ).toBeVisible();
  await expect(page.getByText("Booked Call", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Erik", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /edit answers/i })).toHaveCount(
    0
  );
  await expectNoHorizontalOverflow(page);
});

test("enter in Step 3 country search does not submit admin form", async ({
  page,
}) => {
  await page.goto("/?admin=1");
  await page.getByRole("button", { name: /choose view|admin/i }).click();
  await expect(
    page.getByRole("dialog", { name: /admin preview/i })
  ).toBeVisible();
  await page.getByRole("button", { name: /booked call - banking/i }).click();
  await page
    .getByRole("button", { name: /step 3.*where are you starting/i })
    .click();

  await page.getByLabel(/currently a resident.*search/i).fill("Argentina");
  await page.keyboard.press("Enter");

  await expect(
    page.getByRole("heading", { name: /where are you starting from/i })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /book a call with us/i })
  ).toHaveCount(0);
  await expect(
    page.getByRole("dialog", { name: /confirm the intake/i })
  ).toHaveCount(0);
});

test("admin preset routes manual triage without showing a calendar", async ({
  page,
}) => {
  await submitAdminPreset(page, /manual triage/i);

  await expect(
    page.getByRole("heading", { name: /submission received/i })
  ).toBeVisible();
  await expect(page.getByText("Redomiciled", { exact: true })).toBeVisible();
  await expect(
    page.getByText(/we.ll review the details and follow up with the right next step/i)
  ).toBeVisible();
  await expect(page.getByText("Manual Triage", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Route", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Owner", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Timeline", { exact: true })).toHaveCount(0);
  await expect(
    page.getByText("No calendar is shown for this route.", { exact: true })
  ).toHaveCount(0);
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
  await expect(page.getByText("Redomiciled", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /go to the free community/i })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /submission received/i })
  ).toHaveCount(0);
  await expect(
    page.getByText("Unqualified / Not Ready", { exact: true })
  ).toHaveCount(0);
  await expect(page.getByText("Route", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Owner", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Timeline", { exact: true })).toHaveCount(0);
  await expect(
    page.getByText("No calendar is shown for this route.", { exact: true })
  ).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("admin preset routes warm low-fit leads to manual triage", async ({
  page,
}) => {
  await submitAdminPreset(page, /warm referral/i);

  await expect(
    page.getByRole("heading", { name: /submission received/i })
  ).toBeVisible();
  await expect(page.getByText("Manual Triage", { exact: true })).toHaveCount(0);
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
  const viewport = page.viewportSize();

  if (viewport && viewport.width < 640) {
    return;
  }

  const verticalOverflow = await page.evaluate(() => {
    const root = document.documentElement;

    return root.scrollHeight - root.clientHeight;
  });

  expect(verticalOverflow).toBeLessThanOrEqual(1);
}

async function submitAdminPreset(page: Page, presetName: RegExp) {
  await page.goto("/?admin=1");
  await page.getByRole("button", { name: /choose view|admin/i }).click();
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

function getSubmissionTaskId(body: unknown) {
  if (!body || typeof body !== "object" || !("ok" in body)) {
    return "";
  }

  const response = body as {
    ok?: unknown;
    persistence?: { taskId?: unknown };
    taskId?: unknown;
  };

  if (typeof response.persistence?.taskId === "string") {
    return response.persistence.taskId;
  }

  if (typeof response.taskId === "string") {
    return response.taskId;
  }

  return "";
}

async function deleteE2eClickUpTasks(
  request: APIRequestContext,
  taskIds: string[]
) {
  if (taskIds.length === 0) {
    return;
  }

  const apiToken = process.env["REDOMICILED_CLICKUP_API_TOKEN"];

  if (!apiToken) {
    throw new Error(
      `E2E created ClickUp task(s) ${taskIds.join(", ")} but REDOMICILED_CLICKUP_API_TOKEN is missing, so cleanup cannot run.`
    );
  }

  for (const taskId of taskIds) {
    await deleteE2eClickUpTask(request, apiToken, taskId);
  }
}

async function deleteE2eClickUpTask(
  request: APIRequestContext,
  apiToken: string,
  taskId: string
) {
  const taskResponse = await request.get(
    `${CLICKUP_API_BASE_URL}/task/${taskId}`,
    {
      headers: clickUpHeaders(apiToken),
    }
  );

  if (taskResponse.status() === 404) {
    return;
  }

  if (!taskResponse.ok()) {
    throw new Error(
      `Failed to verify E2E ClickUp task ${taskId} before cleanup: ${taskResponse.status()}.`
    );
  }

  const task = (await taskResponse.json()) as { name?: unknown };
  const taskName = typeof task.name === "string" ? task.name : "";

  if (!taskName.startsWith("TEST ")) {
    throw new Error(
      `Refusing to delete ClickUp task ${taskId} because it is not test-marked. Task name: ${taskName}`
    );
  }

  const deleteResponse = await request.delete(
    `${CLICKUP_API_BASE_URL}/task/${taskId}`,
    {
      headers: clickUpHeaders(apiToken),
    }
  );

  if (!deleteResponse.ok() && deleteResponse.status() !== 404) {
    throw new Error(
      `Failed to delete E2E ClickUp task ${taskId}: ${deleteResponse.status()}.`
    );
  }
}

function clickUpHeaders(apiToken: string) {
  return {
    Authorization: apiToken,
    "Content-Type": "application/json",
  };
}
