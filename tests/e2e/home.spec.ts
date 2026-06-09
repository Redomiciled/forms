import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

const CLICKUP_API_BASE_URL = "https://api.clickup.com/api/v2";
const REDOMICILED_CRM_LIST_ID = "901217458864";
const FIELD_IDS = {
  email: "cfe207d1-c5a3-47b7-bd72-eae0d5c0c708",
  leadSource: "f4b729b2-a300-4bb0-a465-08c51e7ad441",
} as const;
const TEST_IGNORE_LEAD_SOURCE_OPTION_ID =
  "0c13ba94-31cf-4479-a8e4-5a5a066aae5c";
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
    await submitAndReadSubmission(page);
  }

  await expect(page.getByTitle(/banking path video/i)).toBeVisible();
  await expect(
    page.getByRole("region", { name: /pre-booking video/i })
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: /booking calendar/i })
  ).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await expectNoPageScroll(page);

  await page.getByRole("button", { name: /book a meeting/i }).click();

  await expect(
    page.getByRole("heading", { name: /book a call with us/i })
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

  await expect(page.getByTitle(/banking path video/i)).toBeVisible();
  await expect(
    page.getByRole("region", { name: /pre-booking video/i })
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: /booking calendar/i })
  ).toHaveCount(0);
  await expect(page.getByText("Booked Call", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Will", { exact: true })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await expectNoPageScroll(page);

  await page.getByRole("button", { name: /book a meeting/i }).click();

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

test("admin preset routes booked non-banking leads to Will calendar", async ({
  page,
}) => {
  await submitAdminPreset(page, /booked call - non-banking/i);

  await expect(page.getByTitle(/bespoke path video/i)).toBeVisible();
  await expect(
    page.getByRole("region", { name: /pre-booking video/i })
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: /booking calendar/i })
  ).toHaveCount(0);
  await expect(page.getByText("Booked Call", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Will", { exact: true })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await expectNoPageScroll(page);

  await page.getByRole("button", { name: /book a meeting/i }).click();

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
    page.getByText(
      /we.ll review the details and follow up with the right next step/i
    )
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
  await submitAdminPreset(page, /unqualified/i);

  await expect(
    page.getByRole("heading", {
      name: /we’ve received your start here answers/i,
    })
  ).toBeVisible();
  await expect(page.getByText("Redomiciled", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /visit free community/i })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /review answers/i })
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
  await page.getByRole("button", { name: /review answers/i }).click();
  await expect(
    page.getByRole("dialog", { name: /confirm the intake/i })
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("test-view unqualified resubmission updates the original ClickUp task", async ({
  page,
  request,
}) => {
  const testRunId = Date.now();
  const firstEmail = `qa-start-here-e2e-original-${testRunId}@example.com`;
  const updatedEmail = `qa-start-here-e2e-updated-${testRunId}@example.com`;

  await page.goto("/?admin=1");
  await page.getByRole("button", { name: /choose view|admin/i }).click();
  await expect(
    page.getByRole("dialog", { name: /admin preview/i })
  ).toBeVisible();
  await page.getByRole("button", { name: /^test - unqualified$/i }).click();
  await page.getByRole("button", { name: /step 1.*contact info/i }).click();
  await page.getByLabel(/email/i).fill(firstEmail);
  await page
    .getByRole("button", { name: /step 4.*commercial readiness/i })
    .click();
  await page.getByRole("button", { name: /complete/i }).click();
  await expect(
    page.getByRole("dialog", { name: /confirm the intake/i })
  ).toBeVisible();

  const firstSubmission = await submitAndReadSubmission(page);
  const firstTaskId = requireSubmissionTaskId(firstSubmission);

  expect(firstSubmission.persistence?.action).toBe("created");
  await expect(
    page.getByRole("heading", {
      name: /we’ve received your start here answers/i,
    })
  ).toBeVisible();
  await assertE2eClickUpTask(request, firstTaskId, {
    email: firstEmail,
    leadSource: "Test (Ignore)",
  });

  await page.getByRole("button", { name: /review answers/i }).click();
  await expect(
    page.getByRole("dialog", { name: /confirm the intake/i })
  ).toBeVisible();
  await page.getByRole("button", { name: /keep editing/i }).click();
  await page.getByRole("button", { name: /step 1.*contact info/i }).click();
  await page.getByLabel(/email/i).fill(updatedEmail);
  await page
    .getByRole("button", { name: /step 4.*commercial readiness/i })
    .click();
  await page.getByRole("button", { name: /complete/i }).click();
  await expect(
    page.getByRole("dialog", { name: /confirm the intake/i })
  ).toBeVisible();

  const secondSubmission = await submitAndReadSubmission(page);

  expect(secondSubmission.persistence?.action).toBe("updated");
  expect(secondSubmission.persistence?.taskId).toBe(firstTaskId);
  await assertE2eClickUpTask(request, firstTaskId, {
    email: updatedEmail,
    leadSource: "Test (Ignore)",
  });
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
  await submitAndReadSubmission(page);
}

async function submitAndReadSubmission(page: Page) {
  const responsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/start-here/submissions") &&
      response.request().method() === "POST"
    );
  });

  await page.getByRole("button", { name: /confirm and continue/i }).click();

  const response = await responsePromise;
  const body = (await response.json()) as E2eSubmissionResponse;

  expect(response.ok(), JSON.stringify(body)).toBe(true);

  return body;
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

function requireSubmissionTaskId(response: E2eSubmissionResponse) {
  const taskId = response.persistence?.taskId;

  if (!response.ok || !taskId) {
    throw new Error("Expected successful submission response with task ID.");
  }

  return taskId;
}

async function assertE2eClickUpTask(
  request: APIRequestContext,
  taskId: string,
  expected: {
    email: string;
    leadSource: "Test (Ignore)";
  }
) {
  const apiToken = requireClickUpApiToken();
  const task = await getE2eClickUpTask(request, apiToken, taskId);
  const fieldDefinitions = await getE2eClickUpFieldDefinitions(
    request,
    apiToken
  );
  const leadSourceOption = getCustomFieldOption(
    task,
    fieldDefinitions,
    FIELD_IDS.leadSource
  );

  expect(task.name).toMatch(/^TEST /);
  expect(getCustomFieldValue(task, FIELD_IDS.email)).toBe(expected.email);
  expect(leadSourceOption?.id).toBe(TEST_IGNORE_LEAD_SOURCE_OPTION_ID);
  expect(leadSourceOption?.name).toBe(expected.leadSource);
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

async function getE2eClickUpTask(
  request: APIRequestContext,
  apiToken: string,
  taskId: string
) {
  const response = await request.get(`${CLICKUP_API_BASE_URL}/task/${taskId}`, {
    headers: clickUpHeaders(apiToken),
  });

  if (!response.ok()) {
    throw new Error(
      `Failed to fetch E2E ClickUp task ${taskId}: ${response.status()}.`
    );
  }

  return (await response.json()) as E2eClickUpTask;
}

async function getE2eClickUpFieldDefinitions(
  request: APIRequestContext,
  apiToken: string
) {
  const response = await request.get(
    `${CLICKUP_API_BASE_URL}/list/${REDOMICILED_CRM_LIST_ID}/field`,
    {
      headers: clickUpHeaders(apiToken),
    }
  );

  if (!response.ok()) {
    throw new Error(
      `Failed to fetch E2E ClickUp fields: ${response.status()}.`
    );
  }

  const body = (await response.json()) as { fields?: E2eClickUpField[] };

  return body.fields ?? [];
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

function requireClickUpApiToken() {
  const apiToken = process.env["REDOMICILED_CLICKUP_API_TOKEN"];

  if (!apiToken) {
    throw new Error("REDOMICILED_CLICKUP_API_TOKEN is required.");
  }

  return apiToken;
}

function getCustomFieldValue(task: E2eClickUpTask, fieldId: string) {
  return task.custom_fields.find((field) => field.id === fieldId)?.value;
}

function getCustomFieldOption(
  task: E2eClickUpTask,
  fieldDefinitions: E2eClickUpField[],
  fieldId: string
) {
  const value = getCustomFieldValue(task, fieldId);
  const fieldDefinition = fieldDefinitions.find(
    (field) => field.id === fieldId
  );

  return fieldDefinition?.type_config?.options?.find(
    (item) => item.id === value || item.orderindex === value
  );
}

type E2eSubmissionResponse = {
  ok?: boolean;
  persistence?: {
    action?: "created" | "updated";
    taskId?: string;
  };
};

type E2eClickUpTask = {
  name?: string;
  custom_fields: Array<{
    id: string;
    value?: unknown;
  }>;
};

type E2eClickUpField = {
  id: string;
  type_config?: {
    options?: Array<{
      id: string;
      name: string;
      orderindex?: number;
    }>;
  };
};
