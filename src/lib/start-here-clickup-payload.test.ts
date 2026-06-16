import { afterEach, describe, expect, it, vi } from "vitest";

import {
  emptyStartHereFormValues,
  type StartHereFormValues,
  type StartHereFormRoute,
} from "./start-here";
import {
  getNativeClickUpStatus,
  persistStartHereSubmission,
} from "./start-here-clickup";

const REDOMICILED_CRM_LIST_ID = "901217458864";
const REDOMICILED_LEAD_TASK_TYPE_ID = 1001;
const OWNER_USER_IDS = {
  Will: 296457746,
  Erik: 99702565,
} as const;
const PAID_CONSULT_OWNER_FIELD_ID = "27044f92-d510-44ee-a6ff-d5f88814db3f";
const ROUTE_CASES: Array<{
  label: string;
  route: StartHereFormRoute;
  status: string;
  values: StartHereFormValues;
}> = [
  {
    label: "booked-call",
    route: "Booked Call",
    status: "START HERE SUBMITTED",
    values: makeValues({
      tryingToSolve: ["New bank account"],
      monthlyRevenueBand: "$25k–$100k / month",
    }),
  },
  {
    label: "manual-triage",
    route: "Manual Triage",
    status: "MANUAL TRIAGE",
    values: makeValues({
      referralDetail: "Introduced by Alex",
      consideringSpecificStructure: "No — I want help finding the right path",
      tryingToSolve: [
        "Diversify my assets globally without changing where I live",
      ],
      businessMainSourceOfIncome: false,
      monthlyRevenueBand: "",
      netWorthBand: "$0–$50k",
      timelineToAct: "Just exploring",
      budgetReadiness: "No",
    }),
  },
  {
    label: "not-ready",
    route: "Unqualified / Not Ready",
    status: "NOT READY",
    values: makeValues({
      consideringSpecificStructure: "No — I want help finding the right path",
      tryingToSolve: [
        "Diversify my assets globally without changing where I live",
      ],
      businessMainSourceOfIncome: false,
      monthlyRevenueBand: "",
      netWorthBand: "$50k–$250k",
      timelineToAct: "6+ months",
      budgetReadiness: "No",
    }),
  },
];

const envSnapshot = { ...process.env };

afterEach(() => {
  process.env = { ...envSnapshot };
});

describe("getNativeClickUpStatus", () => {
  it.each(ROUTE_CASES)(
    "maps $route to the $status native ClickUp status",
    ({ route, status }) => {
      expect(getNativeClickUpStatus(route)).toBe(status);
    }
  );
});

describe("Start Here ClickUp task payloads", () => {
  it.each(ROUTE_CASES)(
    "sets native status to $status when creating a $label task",
    async ({ route, status, values }) => {
      configureLiveWrites();

      const fetchMock = makeClickUpFetchMock();

      const result = await persistStartHereSubmission(values, {
        fetchImpl: fetchMock.fetchImpl,
        qaMode: true,
      });

      expect(result.submission.fields.startHereFormRoute).toBe(route);
      expect(fetchMock.createBodies).toHaveLength(1);
      expect(fetchMock.createBodies[0]).toMatchObject({
        status,
        custom_item_id: REDOMICILED_LEAD_TASK_TYPE_ID,
        notify_all: false,
      });
      expect(
        (fetchMock.createBodies[0] as Record<string, unknown>)["assignees"]
      ).toEqual(route === "Booked Call" ? [OWNER_USER_IDS.Will] : undefined);
      expect(getCreateCustomFields(fetchMock.createBodies[0]).length).toBe(26);
    }
  );

  it("creates the task with all custom fields in the create request", async () => {
    configureLiveWrites();

    const fetchMock = makeClickUpFetchMock();

    await persistStartHereSubmission(makeValues(), {
      fetchImpl: fetchMock.fetchImpl,
      qaMode: true,
    });

    expect(fetchMock.listSearchCount).toBe(0);
    expect(fetchMock.createBodies).toHaveLength(1);
    expect(getCreateCustomFields(fetchMock.createBodies[0])).toContainEqual({
      id: "cfe207d1-c5a3-47b7-bd72-eae0d5c0c708",
      value: "taylor@example.com",
    });
    expect(getCreateCustomFields(fetchMock.createBodies[0])).toContainEqual({
      id: PAID_CONSULT_OWNER_FIELD_ID,
      value: {
        add: [OWNER_USER_IDS.Will],
        rem: [OWNER_USER_IDS.Erik],
      },
    });
  });
});

function makeClickUpFetchMock() {
  const createBodies: unknown[] = [];
  let listSearchCount = 0;

  const fetchImpl: typeof fetch = vi.fn(async (input, init) => {
    const url = String(input);

    if (url.includes(`/list/${REDOMICILED_CRM_LIST_ID}/task?`)) {
      listSearchCount += 1;
      return jsonResponse({ tasks: [] });
    }

    if (
      url.endsWith(`/list/${REDOMICILED_CRM_LIST_ID}/task`) &&
      init?.method === "POST"
    ) {
      createBodies.push(JSON.parse(String(init.body)));

      return jsonResponse({ id: "created-start-here-task" });
    }

    throw new Error(`Unexpected ClickUp mock request: ${url}`);
  });

  return {
    createBodies,
    get listSearchCount() {
      return listSearchCount;
    },
    fetchImpl,
  };
}

function configureLiveWrites() {
  process.env["REDOMICILED_CLICKUP_API_TOKEN"] = "mock-clickup-token";
  process.env["REDOMICILED_CLICKUP_CRM_LIST_ID"] = REDOMICILED_CRM_LIST_ID;
}

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

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
    },
  });
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
