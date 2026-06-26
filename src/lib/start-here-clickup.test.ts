import { POST } from "@/app/api/start-here/submissions/route";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  emptyStartHereFormValues,
  prepareStartHereSubmission,
  type StartHereFormValues,
} from "./start-here";
import {
  buildClickUpFieldValues,
  persistStartHereSubmission,
} from "./start-here-clickup";
import type { StartHereSubmissionResponse } from "./start-here-submission";

const CLICKUP_API_BASE_URL = "https://api.clickup.com/api/v2";
const REDOMICILED_CRM_LIST_ID = "901217458864";
const REDOMICILED_LEAD_TASK_TYPE_ID = 1001;

const FIELD_IDS = {
  firstName: "b6b2590d-58a3-463b-8e38-691c791e0f7f",
  lastName: "c63b5e5a-220f-49f2-8b0f-1da4137139d1",
  email: "cfe207d1-c5a3-47b7-bd72-eae0d5c0c708",
  phone: "3a356107-fadc-41c2-90fd-46b4af007fdf",
  leadSource: "ca71b224-d78d-4b83-ac83-f78a6ac50054",
  startHereAnswers: "fa954f53-1c02-4c8e-aaab-e90259a8250c",
  startHereFormRoute: "0ed775f3-ae23-43ea-8f70-d1ecd161a301",
  startHereFormRouteReason: "86714782-7be3-4823-9095-de518c8057c5",
  routingDecisionSignals: "aa730523-3be9-4f95-abe4-82548635ddda",
  servicePath: "f8578a38-9aa4-4355-bf75-72eeb780fbc2",
  bookedCallOwner: "580ba4f1-6479-4255-a0c5-be049e3b4e21",
  paidConsultOwner: "27044f92-d510-44ee-a6ff-d5f88814db3f",
  calComBookingId: "7d5007ea-07e9-4796-a656-49e8548a032c",
} as const;

const OPTION_IDS = {
  startHereFormRoute: {
    unqualified: "ddc9bb23-b40a-44e8-9d69-2387a2d0752e",
    bookedCall: "ed6fe3c3-d74e-4d71-90d4-5882eb16a7f6",
    manualTriage: "05d90179-eaea-4880-930f-8134a683b5f5",
  },
  routingDecisionSignals: {
    warmSource: "454af5ca-f08a-434a-8dfd-210470459274",
    knownProductPath: "278d9d11-58eb-4dd5-9f1f-1dacdcb6889b",
    complexGuidanceLed: "37a11262-ef41-4446-81e9-0714565cbe9b",
    mixedUnclearAnswers: "220191f3-2b95-4d0f-b6b1-5bdddf9abf55",
    noClearPath: "ded5ecf0-8b94-4533-adf0-044e8fa74863",
    lowCommercialSignal: "9d1e5bfc-c9a3-4eab-8aff-e20a7e79538b",
    urgentLowCommercialSignal: "014a2e08-21b9-4cb0-bc07-80ec0bb2548a",
    budgetReadinessRescue: "17b7d2c4-faaf-4a17-8edf-d3c912d31b08",
  },
  servicePath: {
    banking: "83b016f6-27e2-4211-9a69-4e50d5caf066",
    bespokePlan: "d5bcdf8f-e800-4d33-b6c0-7f4a830297b0",
    otherManualReview: "7a457ec8-5484-42be-86a1-1ca0578682a1",
    unknown: "a6623135-d2a7-43b3-8013-c52a77562f88",
  },
} as const;

const CLICKUP_FIELD_CONTRACT: Array<{
  fieldId: string;
  optionIds?: string[];
  optionNames?: Record<string, string>;
}> = [
  { fieldId: FIELD_IDS.firstName },
  { fieldId: FIELD_IDS.lastName },
  { fieldId: FIELD_IDS.email },
  { fieldId: FIELD_IDS.phone },
  { fieldId: FIELD_IDS.leadSource },
  { fieldId: FIELD_IDS.startHereAnswers },
  {
    fieldId: FIELD_IDS.startHereFormRoute,
    optionIds: Object.values(OPTION_IDS.startHereFormRoute),
  },
  { fieldId: FIELD_IDS.startHereFormRouteReason },
  {
    fieldId: FIELD_IDS.routingDecisionSignals,
    optionIds: Object.values(OPTION_IDS.routingDecisionSignals),
  },
  {
    fieldId: FIELD_IDS.servicePath,
    optionIds: Object.values(OPTION_IDS.servicePath),
  },
  { fieldId: FIELD_IDS.bookedCallOwner },
  { fieldId: FIELD_IDS.paidConsultOwner },
  { fieldId: FIELD_IDS.calComBookingId },
] as const;

const OWNER_USER_IDS = {
  Will: 296457746,
  Erik: 99702565,
} as const;

const envSnapshot = { ...process.env };
let fieldDefinitions: ClickUpCustomField[] = [];

beforeAll(async () => {
  const apiToken = requireClickUpApiToken();

  fieldDefinitions = (
    await clickUpRequest<ClickUpCustomFieldsResponse>(
      apiToken,
      `/list/${REDOMICILED_CRM_LIST_ID}/field`
    )
  ).fields;
});

afterEach(() => {
  process.env = { ...envSnapshot };
});

describe("buildClickUpFieldValues", () => {
  it("maps form values to live ClickUp field values and option IDs", () => {
    const values = makeValues({
      tryingToSolve: ["New bank account"],
      monthlyRevenueBand: "$25k–$100k / month",
      budgetReadiness: "Maybe, if the fit is clear",
    });

    const clickUpFields = buildClickUpFieldValues(
      prepareStartHereSubmission(values)
    );

    expect(clickUpFields).toContainEqual({
      id: FIELD_IDS.email,
      value: "taylor@example.com",
    });
    expect(clickUpFields).toContainEqual({
      id: FIELD_IDS.leadSource,
      value: "Start Here Form",
    });

    const startHereAnswers = parseStartHereAnswersField(clickUpFields);

    expect(startHereAnswers.schema).toBe("redomiciled.start_here_answers.v1");
    expect(getStartHereAnswer(startHereAnswers, "tryingToSolve")).toEqual([
      "New bank account",
    ]);
    expect(getStartHereAnswer(startHereAnswers, "monthlyRevenueBand")).toBe(
      "$25k–$100k / month"
    );
    expect(getStartHereAnswer(startHereAnswers, "budgetReadiness")).toBe(
      "Maybe, if the fit is clear"
    );
    expect(clickUpFields).toContainEqual({
      id: FIELD_IDS.servicePath,
      value: OPTION_IDS.servicePath.banking,
    });
    expect(clickUpFields).toContainEqual({
      id: FIELD_IDS.bookedCallOwner,
      value: {
        add: [OWNER_USER_IDS.Will],
        rem: [OWNER_USER_IDS.Erik],
      },
    });
    expect(clickUpFields).toContainEqual({
      id: FIELD_IDS.paidConsultOwner,
      value: {
        add: [OWNER_USER_IDS.Will],
        rem: [OWNER_USER_IDS.Erik],
      },
    });
  });

  it("stores current residence in Start Here Answers", () => {
    const clickUpFields = buildClickUpFieldValues(
      prepareStartHereSubmission(makeValues())
    );
    const startHereAnswers = parseStartHereAnswersField(clickUpFields);

    expect(getStartHereAnswer(startHereAnswers, "currentResidence")).toBe(
      "Argentina"
    );
  });

  it("uses Test (Ignore) when QA mode maps field values", () => {
    const clickUpFields = buildClickUpFieldValues(
      prepareStartHereSubmission(makeValues()),
      { qaMode: true }
    );

    expect(clickUpFields).toContainEqual({
      id: FIELD_IDS.leadSource,
      value: "Test (Ignore)",
    });
  });

  it("uses arbitrary text when the submission source is provided", () => {
    const clickUpFields = buildClickUpFieldValues(
      prepareStartHereSubmission(makeValues(), {
        leadSource: "partner webinar",
      })
    );

    expect(clickUpFields).toContainEqual({
      id: FIELD_IDS.leadSource,
      value: "partner webinar",
    });
  });

  it("maps non-banking booked calls to Bespoke plan owned by Erik", () => {
    const clickUpFields = buildClickUpFieldValues(
      prepareStartHereSubmission(
        makeValues({
          tryingToSolve: ["Get a second passport"],
          monthlyRevenueBand: "$25k–$100k / month",
        })
      )
    );

    expect(clickUpFields).toContainEqual({
      id: FIELD_IDS.servicePath,
      value: OPTION_IDS.servicePath.bespokePlan,
    });
    expect(clickUpFields).toContainEqual({
      id: FIELD_IDS.bookedCallOwner,
      value: {
        add: [OWNER_USER_IDS.Erik],
        rem: [OWNER_USER_IDS.Will],
      },
    });
    expect(clickUpFields).toContainEqual({
      id: FIELD_IDS.paidConsultOwner,
      value: {
        add: [OWNER_USER_IDS.Will],
        rem: [OWNER_USER_IDS.Erik],
      },
    });
  });

  it("maps manual triage to Other / manual review", () => {
    const clickUpFields = buildClickUpFieldValues(
      prepareStartHereSubmission(
        makeValues({
          referralDetail: "Introduced by Alex",
          consideringSpecificStructure:
            "No — I want help finding the right path",
          tryingToSolve: [
            "Diversify my assets globally without changing where I live",
          ],
          businessMainSourceOfIncome: false,
          monthlyRevenueBand: "",
          netWorthBand: "$0–$50k",
          timelineToAct: "Just exploring",
          budgetReadiness: "No",
        })
      )
    );

    expect(clickUpFields).toContainEqual({
      id: FIELD_IDS.servicePath,
      value: OPTION_IDS.servicePath.otherManualReview,
    });
  });
});

describe("live ClickUp field contract", () => {
  it("contains every Start Here field and option ID used by the mapper", () => {
    for (const fieldContract of CLICKUP_FIELD_CONTRACT) {
      const field = getFieldDefinition(fieldContract.fieldId);

      expect(field.id).toBe(fieldContract.fieldId);

      for (const optionId of fieldContract.optionIds ?? []) {
        expect(
          field.type_config?.options?.some((option) => option.id === optionId),
          `${fieldContract.fieldId} is missing option ${optionId}`
        ).toBe(true);
      }

      for (const [optionId, optionName] of Object.entries(
        fieldContract.optionNames ?? {}
      )) {
        expect(getFieldOption(fieldContract.fieldId, optionId).name).toBe(
          optionName
        );
      }
    }
  });
});

describe("Start Here ClickUp API persistence", () => {
  it("creates new records as ClickUp Lead task type", async () => {
    const createBodies: unknown[] = [];

    configureLiveWrites();

    const fetchImpl: typeof fetch = vi.fn(async (input, init) => {
      const url = String(input);

      if (url.includes(`/list/${REDOMICILED_CRM_LIST_ID}/task?`)) {
        return jsonResponse({ tasks: [] });
      }

      if (
        url.endsWith(`/list/${REDOMICILED_CRM_LIST_ID}/task`) &&
        init?.method === "POST"
      ) {
        createBodies.push(JSON.parse(String(init.body)));

        return jsonResponse({ id: "qa-lead-task" });
      }

      throw new Error(`Unexpected ClickUp mock request: ${url}`);
    });

    const result = await persistStartHereSubmission(makeValues(), {
      fetchImpl,
      qaMode: true,
    });

    expect(result.persistence).toMatchObject({
      action: "created",
      taskId: "qa-lead-task",
    });
    expect(createBodies).toHaveLength(1);
    expect(createBodies[0]).toMatchObject({
      assignees: [OWNER_USER_IDS.Erik],
      custom_item_id: REDOMICILED_LEAD_TASK_TYPE_ID,
      notify_all: false,
    });
    expect(createBodies[0]).toMatchObject({
      markdown_content: expect.stringContaining("**Route:** Booked Call"),
    });
    expect(
      (createBodies[0] as { markdown_content?: string }).markdown_content
    ).not.toContain("Start Here submission:");
    expect(
      (createBodies[0] as { markdown_content?: string }).markdown_content
    ).toContain("### Answers");
    expect(
      (createBodies[0] as { markdown_content?: string }).markdown_content
    ).toContain("- **Source detail:** Other");
    expect(createBodies[0]).not.toHaveProperty("description");
    expect(getCreateCustomFields(createBodies[0])).toContainEqual({
      id: FIELD_IDS.email,
      value: "taylor@example.com",
    });
    expect(getCreateCustomFields(createBodies[0])).toContainEqual({
      id: FIELD_IDS.leadSource,
      value: "Test (Ignore)",
    });
  });

  it("maps arbitrary source query values to the Lead Source text field", async () => {
    const createBodies: unknown[] = [];

    configureLiveWrites();

    const fetchImpl: typeof fetch = vi.fn(async (input, init) => {
      const url = String(input);

      if (
        url.endsWith(`/list/${REDOMICILED_CRM_LIST_ID}/task`) &&
        init?.method === "POST"
      ) {
        createBodies.push(JSON.parse(String(init.body)));

        return jsonResponse({ id: "landing-page-lead-task" });
      }

      throw new Error(`Unexpected ClickUp mock request: ${url}`);
    });

    await persistStartHereSubmission(makeValues(), {
      fetchImpl,
      source: "partner webinar",
    });

    expect(getCreateCustomFields(createBodies[0])).toContainEqual({
      id: FIELD_IDS.leadSource,
      value: "partner webinar",
    });
  });

  it("creates a new CRM record when the email already exists", async () => {
    const createBodies: unknown[] = [];

    configureLiveWrites();

    const fetchImpl: typeof fetch = vi.fn(async (input, init) => {
      const url = String(input);

      if (url.includes(`/list/${REDOMICILED_CRM_LIST_ID}/task?`)) {
        throw new Error(
          "Fresh Start Here submissions should not lookup by email."
        );
      }

      if (
        url.endsWith(`/list/${REDOMICILED_CRM_LIST_ID}/task`) &&
        init?.method === "POST"
      ) {
        createBodies.push(JSON.parse(String(init.body)));

        return jsonResponse({ id: "new-lead-task" });
      }

      throw new Error(`Unexpected ClickUp mock request: ${url}`);
    });

    const result = await persistStartHereSubmission(
      makeValues({ phone: "+1 555 0199" }),
      {
        fetchImpl,
        qaMode: true,
      }
    );

    expect(result.persistence).toMatchObject({
      action: "created",
      taskId: "new-lead-task",
    });
    expect(createBodies).toHaveLength(1);
    expect(createBodies[0]).toMatchObject({
      assignees: [OWNER_USER_IDS.Erik],
      custom_item_id: REDOMICILED_LEAD_TASK_TYPE_ID,
      notify_all: false,
      status: "START HERE SUBMITTED",
    });
    expect(getCreateCustomFields(createBodies[0])).toContainEqual({
      id: FIELD_IDS.email,
      value: "taylor@example.com",
    });
    expect(getCreateCustomFields(createBodies[0])).toContainEqual({
      id: FIELD_IDS.phone,
      value: "+1 555 0199",
    });
  });

  it("updates the supplied ClickUp task ID without email lookup", async () => {
    const updateBodies: unknown[] = [];
    const fieldUpdateBodies: Array<{ fieldId: string; body: unknown }> = [];

    configureLiveWrites();

    const fetchImpl: typeof fetch = vi.fn(async (input, init) => {
      const url = String(input);

      if (url.includes(`/list/${REDOMICILED_CRM_LIST_ID}/task?`)) {
        throw new Error("Email lookup should not run when taskId is supplied.");
      }

      if (url.endsWith("/task/known-lead-task") && init?.method === "PUT") {
        updateBodies.push(JSON.parse(String(init.body)));

        return jsonResponse({ id: "known-lead-task" });
      }

      if (
        url.includes("/task/known-lead-task/field/") &&
        init?.method === "POST"
      ) {
        fieldUpdateBodies.push({
          fieldId: url.split("/field/")[1] ?? "",
          body: JSON.parse(String(init.body)),
        });

        return jsonResponse({});
      }

      throw new Error(`Unexpected ClickUp mock request: ${url}`);
    });

    const result = await persistStartHereSubmission(
      makeValues({ email: "changed@example.com" }),
      {
        fetchImpl,
        qaMode: true,
        taskId: "known-lead-task",
      }
    );

    expect(result.persistence).toMatchObject({
      action: "updated",
      taskId: "known-lead-task",
    });
    expect(updateBodies).toHaveLength(1);
    expect(updateBodies[0]).toMatchObject({
      assignees: {
        add: [OWNER_USER_IDS.Erik],
        rem: [OWNER_USER_IDS.Will],
      },
      markdown_content: expect.stringContaining("**Route:** Booked Call"),
    });
    expect(updateBodies[0]).not.toHaveProperty("description");
    expect(fieldUpdateBodies).toContainEqual({
      fieldId: FIELD_IDS.email,
      body: { value: "changed@example.com" },
    });
    expect(fieldUpdateBodies).toContainEqual({
      fieldId: FIELD_IDS.paidConsultOwner,
      body: {
        value: {
          add: [OWNER_USER_IDS.Will],
          rem: [OWNER_USER_IDS.Erik],
        },
      },
    });
  });

  it("updates ClickUp custom fields with bounded parallel requests", async () => {
    let activeFieldRequests = 0;
    let maxActiveFieldRequests = 0;
    let fieldRequestCount = 0;

    configureLiveWrites();

    const fetchImpl: typeof fetch = vi.fn(async (input, init) => {
      const url = String(input);

      if (url.includes(`/list/${REDOMICILED_CRM_LIST_ID}/task?`)) {
        throw new Error("Email lookup should not run when taskId is supplied.");
      }

      if (url.endsWith("/task/known-lead-task") && init?.method === "PUT") {
        return jsonResponse({ id: "known-lead-task" });
      }

      if (
        url.includes("/task/known-lead-task/field/") &&
        init?.method === "POST"
      ) {
        activeFieldRequests += 1;
        maxActiveFieldRequests = Math.max(
          maxActiveFieldRequests,
          activeFieldRequests
        );
        fieldRequestCount += 1;
        await wait(5);
        activeFieldRequests -= 1;

        return jsonResponse({});
      }

      throw new Error(`Unexpected ClickUp mock request: ${url}`);
    });

    const values = makeValues({ email: "changed@example.com" });
    const expectedFieldCount = buildClickUpFieldValues(
      prepareStartHereSubmission(values),
      { qaMode: true }
    ).length;

    await persistStartHereSubmission(values, {
      fetchImpl,
      qaMode: true,
      taskId: "known-lead-task",
    });

    expect(fieldRequestCount).toBe(expectedFieldCount);
    expect(maxActiveFieldRequests).toBeGreaterThan(1);
    expect(maxActiveFieldRequests).toBeLessThanOrEqual(6);
  });

  it("creates, verifies, and deletes a production-list QA task through the API route", async () => {
    const apiToken = requireClickUpApiToken();
    const testRunId = globalThis.crypto.randomUUID();
    const email = `qa-start-here-${testRunId}@example.com`;
    const createdTaskIds = new Set<string>();

    configureLiveWrites();

    try {
      const createValues = makeQaValues(testRunId, {
        email,
        tryingToSolve: ["New bank account"],
        importantRoutingNotes:
          "Automated ClickUp integration test. Safe to delete.",
      });
      const createResponse = await postStartHereSubmission(createValues);

      if (!createResponse.ok) {
        if (createResponse.taskId) {
          createdTaskIds.add(createResponse.taskId);
        }

        throw new Error(createResponse.error.message);
      }
      expect(createResponse.ok).toBe(true);

      const taskId = requireTaskId(createResponse);

      expect(createResponse.persistence).toMatchObject({
        mode: "live",
        action: "created",
      });
      createdTaskIds.add(taskId);

      const createdTask = await clickUpRequest<ClickUpTask>(
        apiToken,
        `/task/${taskId}`
      );

      assertTaskIdentity(createdTask, testRunId, email);
      assertCustomFields(createdTask, {
        [FIELD_IDS.firstName]: "QA START HERE - Test Ignore -",
        [FIELD_IDS.lastName]: testRunId,
        [FIELD_IDS.email]: email,
        [FIELD_IDS.phone]: "+1 555 0100",
        [FIELD_IDS.leadSource]: "Test (Ignore)",
        [FIELD_IDS.startHereFormRoute]: optionReadValue(
          FIELD_IDS.startHereFormRoute,
          OPTION_IDS.startHereFormRoute.bookedCall
        ),
        [FIELD_IDS.startHereFormRouteReason]:
          "Specific product/path intent with enough revenue or net worth signal.",
        [FIELD_IDS.routingDecisionSignals]: labelsReadValue(
          FIELD_IDS.routingDecisionSignals,
          [
            OPTION_IDS.routingDecisionSignals.knownProductPath,
            OPTION_IDS.routingDecisionSignals.urgentLowCommercialSignal,
          ]
        ),
        [FIELD_IDS.servicePath]: optionReadValue(
          FIELD_IDS.servicePath,
          OPTION_IDS.servicePath.banking
        ),
        [FIELD_IDS.bookedCallOwner]: [OWNER_USER_IDS.Will],
        [FIELD_IDS.paidConsultOwner]: [OWNER_USER_IDS.Will],
        [FIELD_IDS.calComBookingId]: "",
      });
      assertStartHereAnswers(createdTask, {
        leadSourceDetail: "Other",
        referralDetail: "",
        warmOverride: false,
        consideringSpecificStructure:
          "Yes — I know what structure I want, or I know I need a bank account",
        tryingToSolve: ["New bank account"],
        setupMaturity:
          "Partially set up — I have some international structure but want to improve it",
        currentResidence: "Argentina",
        passportsCitizenships: "United States",
        businessMainSourceOfIncome: true,
        monthlyRevenueBand: "$25k–$100k / month",
        netWorthBand: "$1M–$5M",
        timelineToAct: "ASAP / 0–3 months",
        budgetReadiness: "Maybe, if the fit is clear",
        importantRoutingNotes:
          "Automated ClickUp integration test. Safe to delete.",
      });

      const secondCreateResponse = await postStartHereSubmission(
        makeQaValues(testRunId, {
          email,
          phone: "+1 555 0199",
          tryingToSolve: ["Get a second passport"],
          importantRoutingNotes:
            "Second automated ClickUp integration test. Safe to delete.",
        })
      );

      if (!secondCreateResponse.ok) {
        if (secondCreateResponse.taskId) {
          createdTaskIds.add(secondCreateResponse.taskId);
        }

        throw new Error(secondCreateResponse.error.message);
      }
      expect(secondCreateResponse.ok).toBe(true);

      const secondTaskId = requireTaskId(secondCreateResponse);

      expect(secondCreateResponse.persistence).toMatchObject({
        mode: "live",
        action: "created",
      });
      expect(secondTaskId).not.toBe(taskId);
      createdTaskIds.add(secondTaskId);

      const secondTask = await clickUpRequest<ClickUpTask>(
        apiToken,
        `/task/${secondTaskId}`
      );

      assertCustomFields(secondTask, {
        [FIELD_IDS.email]: email,
        [FIELD_IDS.phone]: "+1 555 0199",
        [FIELD_IDS.servicePath]: optionReadValue(
          FIELD_IDS.servicePath,
          OPTION_IDS.servicePath.bespokePlan
        ),
        [FIELD_IDS.bookedCallOwner]: [OWNER_USER_IDS.Erik],
        [FIELD_IDS.paidConsultOwner]: [OWNER_USER_IDS.Will],
      });
      assertStartHereAnswers(secondTask, {
        tryingToSolve: ["Get a second passport"],
        importantRoutingNotes:
          "Second automated ClickUp integration test. Safe to delete.",
      });
    } finally {
      await deleteAndVerifyQaTasks(apiToken, [...createdTaskIds]);
    }
  }, 90_000);

  it("writes no owner for manual-triage QA submissions through the API route", async () => {
    const apiToken = requireClickUpApiToken();
    const testRunId = globalThis.crypto.randomUUID();
    const email = `qa-start-here-manual-${testRunId}@example.com`;
    const createdTaskIds = new Set<string>();

    configureLiveWrites();

    try {
      const response = await postStartHereSubmission(
        makeQaValues(testRunId, {
          email,
          referralDetail: "Introduced by Alex",
          consideringSpecificStructure:
            "No — I want help finding the right path",
          tryingToSolve: [
            "Diversify my assets globally without changing where I live",
          ],
          businessMainSourceOfIncome: false,
          monthlyRevenueBand: "",
          netWorthBand: "$0–$50k",
          timelineToAct: "Just exploring",
          budgetReadiness: "No",
        })
      );

      if (!response.ok) {
        if (response.taskId) {
          createdTaskIds.add(response.taskId);
        }

        throw new Error(response.error.message);
      }
      expect(response.ok).toBe(true);

      const taskId = requireTaskId(response);
      createdTaskIds.add(taskId);

      const task = await clickUpRequest<ClickUpTask>(
        apiToken,
        `/task/${taskId}`
      );

      assertTaskIdentity(task, testRunId, email);
      assertCustomFields(task, {
        [FIELD_IDS.leadSource]: "Test (Ignore)",
        [FIELD_IDS.startHereFormRoute]: optionReadValue(
          FIELD_IDS.startHereFormRoute,
          OPTION_IDS.startHereFormRoute.manualTriage
        ),
        [FIELD_IDS.startHereFormRouteReason]:
          "Warm lead should not be auto-disqualified; route for relationship-aware review.",
        [FIELD_IDS.routingDecisionSignals]: labelsReadValue(
          FIELD_IDS.routingDecisionSignals,
          [
            OPTION_IDS.routingDecisionSignals.warmSource,
            OPTION_IDS.routingDecisionSignals.complexGuidanceLed,
            OPTION_IDS.routingDecisionSignals.noClearPath,
            OPTION_IDS.routingDecisionSignals.lowCommercialSignal,
          ]
        ),
        [FIELD_IDS.servicePath]: optionReadValue(
          FIELD_IDS.servicePath,
          OPTION_IDS.servicePath.otherManualReview
        ),
        [FIELD_IDS.bookedCallOwner]: [],
        [FIELD_IDS.paidConsultOwner]: [OWNER_USER_IDS.Will],
      });
      assertStartHereAnswers(task, {
        leadSourceDetail: "Warm Referral",
        referralDetail: "Introduced by Alex",
        warmOverride: true,
        consideringSpecificStructure: "No — I want help finding the right path",
        tryingToSolve: [
          "Diversify my assets globally without changing where I live",
        ],
        businessMainSourceOfIncome: false,
        monthlyRevenueBand: "Not applicable",
        netWorthBand: "$0–$50k",
        timelineToAct: "Just exploring",
        budgetReadiness: "No",
      });
    } finally {
      await deleteAndVerifyQaTasks(apiToken, [...createdTaskIds]);
    }
  }, 90_000);

  it("writes unqualified-route QA submissions through the API route", async () => {
    const apiToken = requireClickUpApiToken();
    const testRunId = globalThis.crypto.randomUUID();
    const email = `qa-start-here-unqualified-${testRunId}@example.com`;
    const createdTaskIds = new Set<string>();

    configureLiveWrites();

    try {
      const response = await postStartHereSubmission(
        makeQaValues(testRunId, {
          email,
          consideringSpecificStructure:
            "No — I want help finding the right path",
          tryingToSolve: [
            "Diversify my assets globally without changing where I live",
          ],
          businessMainSourceOfIncome: false,
          monthlyRevenueBand: "",
          netWorthBand: "$50k–$250k",
          timelineToAct: "6+ months",
          budgetReadiness: "No",
        })
      );

      if (!response.ok) {
        if (response.taskId) {
          createdTaskIds.add(response.taskId);
        }

        throw new Error(response.error.message);
      }
      expect(response.ok).toBe(true);

      const taskId = requireTaskId(response);
      createdTaskIds.add(taskId);

      const task = await clickUpRequest<ClickUpTask>(
        apiToken,
        `/task/${taskId}`
      );

      assertTaskIdentity(task, testRunId, email);
      assertCustomFields(task, {
        [FIELD_IDS.leadSource]: "Test (Ignore)",
        [FIELD_IDS.startHereFormRoute]: optionReadValue(
          FIELD_IDS.startHereFormRoute,
          OPTION_IDS.startHereFormRoute.unqualified
        ),
        [FIELD_IDS.startHereFormRouteReason]:
          "Low commercial signal, low urgency, and not ready to invest at the minimum professional fee level.",
        [FIELD_IDS.routingDecisionSignals]: labelsReadValue(
          FIELD_IDS.routingDecisionSignals,
          [
            OPTION_IDS.routingDecisionSignals.complexGuidanceLed,
            OPTION_IDS.routingDecisionSignals.noClearPath,
            OPTION_IDS.routingDecisionSignals.lowCommercialSignal,
          ]
        ),
        [FIELD_IDS.servicePath]: optionReadValue(
          FIELD_IDS.servicePath,
          OPTION_IDS.servicePath.unknown
        ),
        [FIELD_IDS.bookedCallOwner]: [],
        [FIELD_IDS.paidConsultOwner]: [OWNER_USER_IDS.Will],
      });
      assertStartHereAnswers(task, {
        consideringSpecificStructure: "No — I want help finding the right path",
        tryingToSolve: [
          "Diversify my assets globally without changing where I live",
        ],
        businessMainSourceOfIncome: false,
        monthlyRevenueBand: "Not applicable",
        netWorthBand: "$50k–$250k",
        timelineToAct: "6+ months",
        budgetReadiness: "No",
      });
    } finally {
      await deleteAndVerifyQaTasks(apiToken, [...createdTaskIds]);
    }
  }, 90_000);
});

function makeValues(
  overrides: Partial<StartHereFormValues> = {}
): StartHereFormValues {
  return {
    ...emptyStartHereFormValues,
    firstName: "Taylor",
    lastName: "Rivera",
    email: "Taylor@Example.com",
    phone: "+1 555 0100",
    consideringSpecificStructure:
      "Yes — I know what structure I want, or I know I need a bank account",
    tryingToSolve: ["Get a second passport"],
    setupMaturity:
      "Partially set up — I have some international structure but want to improve it",
    currentResidence: "Argentina",
    passportsCitizenships: "United States",
    businessMainSourceOfIncome: true,
    monthlyRevenueBand: "$25k–$100k / month",
    netWorthBand: "$1M–$5M",
    timelineToAct: "ASAP / 0–3 months",
    budgetReadiness: "Maybe, if the fit is clear",
    ...overrides,
  };
}

function makeQaValues(
  testRunId: string,
  overrides: Partial<StartHereFormValues> = {}
) {
  return makeValues({
    firstName: "QA START HERE - Test Ignore -",
    lastName: testRunId,
    email: `qa-start-here-${testRunId}@example.com`,
    importantRoutingNotes:
      "Automated ClickUp integration test. Safe to delete.",
    ...overrides,
  });
}

function configureLiveWrites() {
  process.env["REDOMICILED_CLICKUP_CRM_LIST_ID"] = REDOMICILED_CRM_LIST_ID;
}

async function postStartHereSubmission(values: StartHereFormValues) {
  const response = await POST(
    new Request("http://localhost/api/start-here/submissions", {
      method: "POST",
      body: JSON.stringify({
        values,
        adminMode: false,
        qaMode: true,
      }),
    })
  );

  return (await response.json()) as StartHereSubmissionResponse;
}

function requireTaskId(response: StartHereSubmissionResponse) {
  if (!response.ok || !response.persistence.taskId) {
    throw new Error("ClickUp submission did not return a task ID.");
  }

  return response.persistence.taskId;
}

function assertTaskIdentity(
  task: ClickUpTask,
  testRunId: string,
  email: string
) {
  expect(task.name).toContain(`QA START HERE - Test Ignore - ${testRunId}`);
  expect(task.list.id).toBe(REDOMICILED_CRM_LIST_ID);
  expect(getClickUpCustomItemId(task)).toBe(REDOMICILED_LEAD_TASK_TYPE_ID);
  expect(getCustomFieldValue(task, FIELD_IDS.email)).toBe(email);
}

function assertCustomFields(
  task: ClickUpTask,
  expectedValues: Record<string, unknown>
) {
  for (const [fieldId, expectedValue] of Object.entries(expectedValues)) {
    const actualValue = getCustomFieldValue(task, fieldId);

    expect(
      normalizeClickUpReadValue(fieldId, actualValue, expectedValue),
      fieldId
    ).toEqual(normalizeClickUpReadValue(fieldId, expectedValue, expectedValue));
  }
}

function assertStartHereAnswers(
  task: ClickUpTask,
  expectedValues: Record<string, unknown>
) {
  const payload = parseStartHereAnswersValue(
    getCustomFieldValue(task, FIELD_IDS.startHereAnswers)
  );

  for (const [key, expectedValue] of Object.entries(expectedValues)) {
    expect(getStartHereAnswer(payload, key), key).toEqual(expectedValue);
  }
}

function parseStartHereAnswersField(customFields: unknown[]) {
  return parseStartHereAnswersValue(
    getPayloadCustomFieldValue(customFields, FIELD_IDS.startHereAnswers)
  );
}

function parseStartHereAnswersValue(value: unknown): StartHereAnswersPayload {
  if (typeof value !== "string") {
    throw new Error("Start Here Answers field did not contain JSON text.");
  }

  const parsed = JSON.parse(value) as unknown;

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray((parsed as { answers?: unknown }).answers)
  ) {
    throw new Error("Start Here Answers JSON did not include answers.");
  }

  return parsed as StartHereAnswersPayload;
}

function getStartHereAnswer(payload: StartHereAnswersPayload, key: string) {
  const answer = payload.answers.find((item) => item.key === key);

  if (!answer) {
    throw new Error(`Start Here Answers JSON did not include ${key}.`);
  }

  return answer.value;
}

function getPayloadCustomFieldValue(customFields: unknown[], fieldId: string) {
  const field = customFields.find(
    (item): item is { id: string; value?: unknown } =>
      item !== null &&
      typeof item === "object" &&
      "id" in item &&
      (item as { id?: unknown }).id === fieldId
  );

  return field?.value;
}

function normalizeClickUpReadValue(
  fieldId: string,
  value: unknown,
  expectedValue: unknown
) {
  if (
    fieldId === FIELD_IDS.bookedCallOwner ||
    fieldId === FIELD_IDS.paidConsultOwner
  ) {
    return normalizeClickUpPeopleValue(value);
  }

  if (typeof expectedValue === "boolean") {
    if (value === undefined || value === null || value === "") {
      return false;
    }

    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }
  }

  const field = getFieldDefinition(fieldId);

  if (!field.type_config?.options) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => getOptionIdForReadValue(fieldId, item));
  }

  return getOptionIdForReadValue(fieldId, value);
}

function normalizeClickUpPeopleValue(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "number") {
        return item;
      }

      if (typeof item === "string") {
        return Number(item);
      }

      if (item && typeof item === "object") {
        if ("id" in item && typeof item.id === "number") {
          return item.id;
        }

        if ("id" in item && typeof item.id === "string") {
          return Number(item.id);
        }

        if ("user_id" in item && typeof item.user_id === "number") {
          return item.user_id;
        }

        if ("user_id" in item && typeof item.user_id === "string") {
          return Number(item.user_id);
        }
      }

      return NaN;
    })
    .filter((item) => Number.isFinite(item));
}

function getOptionIdForReadValue(fieldId: string, value: unknown) {
  const field = getFieldDefinition(fieldId);
  const option = field.type_config?.options?.find(
    (item) => item.id === value || item.orderindex === value
  );

  return option?.id ?? value;
}

function optionReadValue(fieldId: string, optionId: string) {
  const option = getFieldOption(fieldId, optionId);

  return option.orderindex ?? option.id;
}

function labelsReadValue(fieldId: string, optionIds: string[]) {
  return optionIds.map((optionId) => optionReadValue(fieldId, optionId));
}

function getFieldOption(fieldId: string, optionId: string) {
  const field = getFieldDefinition(fieldId);
  const option = field?.type_config?.options?.find(
    (item) => item.id === optionId
  );

  if (!option) {
    throw new Error(`ClickUp option ${optionId} was not found on ${fieldId}.`);
  }

  return option;
}

function getFieldDefinition(fieldId: string) {
  const field = fieldDefinitions.find((item) => item.id === fieldId);

  if (!field) {
    throw new Error(`ClickUp field ${fieldId} was not found.`);
  }

  return field;
}

function getClickUpCustomItemId(task: ClickUpTask): number | undefined {
  if (typeof task.custom_item_id === "number") {
    return task.custom_item_id;
  }

  if (isClickUpCustomItem(task.custom_item)) {
    return getClickUpNestedCustomItemId(task.custom_item);
  }

  if (isClickUpCustomItem(task.task_type)) {
    return getClickUpNestedCustomItemId(task.task_type);
  }

  if (isClickUpCustomItem(task.type)) {
    return getClickUpNestedCustomItemId(task.type);
  }

  return undefined;
}

function getClickUpNestedCustomItemId(
  item: ClickUpNestedCustomItem
): number | undefined {
  return item.custom_item_id ?? item.id;
}

function isClickUpCustomItem(value: unknown): value is ClickUpNestedCustomItem {
  return value !== null && typeof value === "object";
}

function requireClickUpApiToken() {
  const apiToken = process.env["REDOMICILED_CLICKUP_API_TOKEN"];

  if (!apiToken) {
    throw new Error(
      "REDOMICILED_CLICKUP_API_TOKEN is required because npm run test performs a live ClickUp create/read/delete integration test."
    );
  }

  return apiToken;
}

async function deleteAndVerifyQaTasks(apiToken: string, taskIds: string[]) {
  for (const taskId of taskIds) {
    await deleteClickUpTask(apiToken, taskId);
    await expectClickUpTaskDeleted(apiToken, taskId);
  }
}

async function deleteClickUpTask(apiToken: string, taskId: string) {
  const response = await fetch(`${CLICKUP_API_BASE_URL}/task/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: apiToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete ClickUp QA task ${taskId}.`);
  }
}

async function expectClickUpTaskDeleted(apiToken: string, taskId: string) {
  const response = await fetch(`${CLICKUP_API_BASE_URL}/task/${taskId}`, {
    headers: {
      Authorization: apiToken,
      "Content-Type": "application/json",
    },
  });

  expect(response.status).toBe(404);
}

async function clickUpRequest<T>(apiToken: string, path: string): Promise<T> {
  const response = await fetch(`${CLICKUP_API_BASE_URL}${path}`, {
    headers: {
      Authorization: apiToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`ClickUp request ${path} failed with ${response.status}.`);
  }

  return (await response.json()) as T;
}

function getCreateCustomFields(body: unknown) {
  if (!body || typeof body !== "object" || !("custom_fields" in body)) {
    throw new Error("ClickUp create body did not include custom_fields.");
  }

  const customFields = (body as { custom_fields?: unknown }).custom_fields;

  if (!Array.isArray(customFields)) {
    throw new Error("ClickUp create body custom_fields was not an array.");
  }

  return customFields;
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getCustomFieldValue(task: ClickUpTask, fieldId: string) {
  return task.custom_fields.find((field) => field.id === fieldId)?.value;
}

type ClickUpCustomFieldsResponse = {
  fields: ClickUpCustomField[];
};

type ClickUpCustomField = {
  id: string;
  name?: string;
  type?: string;
  type_config?: {
    options?: Array<{
      id: string;
      name: string;
      orderindex?: number;
    }>;
  };
};

type ClickUpNestedCustomItem = {
  id?: number;
  custom_item_id?: number;
};

type ClickUpTask = {
  id: string;
  name: string;
  custom_item_id?: number;
  custom_item?: unknown;
  task_type?: unknown;
  type?: unknown;
  list: {
    id: string;
  };
  custom_fields: Array<{
    id: string;
    value?: unknown;
  }>;
};

type StartHereAnswersPayload = {
  schema?: string;
  answers: Array<{
    key: string;
    label?: string;
    value: unknown;
  }>;
};
