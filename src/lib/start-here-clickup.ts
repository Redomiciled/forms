import {
  type BudgetReadiness,
  type ConsideringSpecificStructure,
  type LeadSourceDetail,
  type MonthlyRevenueBand,
  type NetWorthBand,
  prepareStartHereSubmission,
  type RoutingDecisionSignal,
  type SetupMaturity,
  type StartHereFormValues,
  type StartHerePreparedSubmission,
  type TimelineToAct,
  type TryingToSolve,
} from "./start-here";
import {
  type StartHerePersistenceResult,
  type StartHereSubmissionErrorCode,
} from "./start-here-submission";

const CLICKUP_API_BASE_URL = "https://api.clickup.com/api/v2";

const REDOMICILED_CRM_LIST_ID = "901217458864";
const REDOMICILED_LEAD_TASK_TYPE_ID = 1001;

const FIELD_IDS = {
  firstName: "b6b2590d-58a3-463b-8e38-691c791e0f7f",
  lastName: "c63b5e5a-220f-49f2-8b0f-1da4137139d1",
  email: "cfe207d1-c5a3-47b7-bd72-eae0d5c0c708",
  phone: "3a356107-fadc-41c2-90fd-46b4af007fdf",
  leadSource: "f4b729b2-a300-4bb0-a465-08c51e7ad441",
  leadSourceDetail: "428ab3fa-d1de-464b-b4d5-4785a51012d0",
  referralDetail: "9eabae2e-f35e-40ab-8284-05526f4e223c",
  warmOverride: "2b9bb488-1791-40cf-9f51-9cc1883de459",
  consideringSpecificStructure: "11af648c-f959-4155-a431-19b173c2f43c",
  tryingToSolve: "f84cb55a-383d-4e72-9423-f17321324b1c",
  setupMaturity: "bbf53e18-3edc-428c-97f7-e30af56da120",
  currentResidency: "793483e6-ff19-4d4b-ac56-d36cc0cb2ec0",
  passportsCitizenships: "af5c8a0b-acbf-4ed7-a0ae-b9d1c2ec8dde",
  businessMainSourceOfIncome: "c41d84b5-6db8-4d04-b8e5-d88396e5b5d3",
  monthlyRevenueBand: "42ae346a-bd16-47a9-bb06-b4a50ace0e2c",
  netWorthBand: "57525f9d-ec68-423a-a4c8-3207c778e5ae",
  timelineToAct: "a06451f1-e78d-46e7-aa53-826c54628f1a",
  budgetReadiness: "c0107b5f-5049-4613-a588-2cc4ca62e997",
  importantRoutingNotes: "e54df295-82b9-43e0-b6ef-daee240eef04",
  startHereFormRoute: "0ed775f3-ae23-43ea-8f70-d1ecd161a301",
  startHereFormRouteReason: "86714782-7be3-4823-9095-de518c8057c5",
  routingDecisionSignals: "aa730523-3be9-4f95-abe4-82548635ddda",
  bookedCallOwner: "580ba4f1-6479-4255-a0c5-be049e3b4e21",
  calComBookingId: "7d5007ea-07e9-4796-a656-49e8548a032c",
} as const;

const OWNER_USER_IDS = {
  Will: 296457746,
  Erik: 99702565,
} as const;

const LEAD_SOURCE_OPTIONS = {
  "Start Here Form": "d9e3fb72-dfce-41e3-b1dc-fdba96a1e546",
} as const;

const QA_LEAD_SOURCE_OPTION_ID = "0c13ba94-31cf-4479-a8e4-5a5a066aae5c";

const LEAD_SOURCE_DETAIL_OPTIONS: Record<LeadSourceDetail, string> = {
  "Community Member": "8494fb8f-a4a7-43c8-9dd8-bf19d1507058",
  "Past Client": "40bf4a6d-7959-41b6-b267-af24f2f0b564",
  "Warm Referral": "11e8dfdf-93ae-446a-bd07-85ec2e02b589",
  "Partner Referral": "df17aa72-9d4d-4461-a9dc-3cb41204c70a",
  "Cold Ad": "f9ed3924-3775-415b-a868-160ce0980eda",
  Other: "95a6fd94-14b7-4d70-9217-2e2f3ae4cb6f",
};

const CONSIDERING_OPTIONS: Record<ConsideringSpecificStructure, string> = {
  "Yes — I know what structure I want, or I know I need a bank account":
    "a11726c9-6838-4c37-9b71-f2d89afaa788",
  "No — I want help finding the right path":
    "c7f9658b-7e4c-4d87-9b6f-814fc111b40a",
  "I just want to check my current structure is compliant":
    "2aea3435-208f-4fd3-882a-412e100082fa",
};

const TRYING_TO_SOLVE_OPTIONS: Record<TryingToSolve, string> = {
  "Relocate my individual tax residency":
    "d0b34714-e90d-4328-b7b9-569178255f35",
  "Set up a new entity that suits me better":
    "d6cb8a8d-bbe9-4d57-a646-33ab423d66ae",
  "Get a second passport": "dca2d8a6-9b99-43a9-8775-49d90c9dfd41",
  "New bank account": "d947e583-9137-4a59-8ac5-52e74d1bc58d",
  "Help with a crypto transaction": "a64ebafc-f478-436e-906a-18ea849ab477",
  "Check if my current structure is compliant":
    "6c08bfc2-e243-4b5c-b79a-3c0a61a5e8dc",
  "Diversify my assets globally without changing where I live":
    "4660e952-ac9a-4865-909f-16cda70d1b17",
};

const SETUP_MATURITY_OPTIONS: Record<SetupMaturity, string> = {
  "New to this — first time moving abroad / first experience with the offshore world":
    "db2dabe8-1a74-4a2b-a884-6f8715e98ccc",
  "Partially set up — I have some international structure but want to improve it":
    "efb7b298-99ba-4b53-a41b-6ed9c49f2d81",
  "Sophisticated setup — I have established structures and need specific expert help":
    "6741e164-5a00-4078-974e-99bee4a5f289",
};

const MONTHLY_REVENUE_OPTIONS: Record<
  MonthlyRevenueBand | "Not applicable",
  string
> = {
  "$0–$5k / month": "c180c0ed-1a83-4ec4-b57e-bb5cf130e743",
  "$5k–$25k / month": "6a98560a-87bd-40ff-b415-002c3e7bd002",
  "$25k–$100k / month": "8ce02323-0210-4722-80e5-d0c7b989e624",
  "$100k–$1M / month": "16862875-be06-439e-99fe-10c25bb3e7ee",
  "$1M+ / month": "735aeac8-669d-4b96-951c-4abe412d3600",
  "Not applicable": "0d3aa7ec-4fec-46bc-9f7d-ad3bfb3e5616",
};

const NET_WORTH_OPTIONS: Record<NetWorthBand, string> = {
  "$0–$50k": "bf88df9c-d10b-4dc7-bfee-105476488583",
  "$50k–$250k": "fbc06021-c2b7-44c6-95cd-885dece6d47b",
  "$250k–$1M": "b07464fc-994a-4d85-a11f-4510786356e9",
  "$1M–$5M": "ccee2708-0778-4c62-a301-e884cd0d4a8c",
  "$5M–$20M": "e34a3a25-d66b-4bb2-8515-83b43cd4b4fa",
  "$20M+": "5faae105-4d39-4b44-ac5d-f9411b628cbf",
};

const TIMELINE_OPTIONS: Record<TimelineToAct, string> = {
  "ASAP / 0–3 months": "41024f5c-27fe-42a9-a00b-ceabb0396a79",
  "3–6 months": "665b91a0-8aee-4dd9-94f9-7de12c36a428",
  "6+ months": "3a7a4292-8365-481b-9c40-c7c20e5cb429",
  "Just exploring": "5e69926d-84b2-493a-b785-5b5f47dd2bd5",
};

const BUDGET_READINESS_OPTIONS: Record<BudgetReadiness, string> = {
  Yes: "efe8ebab-55a8-4956-a2d7-487f272a8ef3",
  "Maybe, if the fit is clear": "4ad8cc7e-cf0e-4464-bf28-e2087aee7e53",
  No: "8059db50-41c9-4044-a305-08fb7b3d57e5",
};

const ROUTE_OPTIONS = {
  "Unqualified / Not Ready": "ddc9bb23-b40a-44e8-9d69-2387a2d0752e",
  "Booked Call": "ed6fe3c3-d74e-4d71-90d4-5882eb16a7f6",
  "Manual Triage": "05d90179-eaea-4880-930f-8134a683b5f5",
} as const;

const ROUTING_SIGNAL_OPTIONS: Record<RoutingDecisionSignal, string> = {
  "Warm source": "454af5ca-f08a-434a-8dfd-210470459274",
  "Known product/path": "278d9d11-58eb-4dd5-9f1f-1dacdcb6889b",
  "Complex / Guidance-led": "37a11262-ef41-4446-81e9-0714565cbe9b",
  "Mixed / Unclear answers": "220191f3-2b95-4d0f-b6b1-5bdddf9abf55",
  "No clear path": "ded5ecf0-8b94-4533-adf0-044e8fa74863",
  "Low commercial signal": "9d1e5bfc-c9a3-4eab-8aff-e20a7e79538b",
  "Urgent low commercial signal": "014a2e08-21b9-4cb0-bc07-80ec0bb2548a",
  "Budget readiness rescue": "17b7d2c4-faaf-4a17-8edf-d3c912d31b08",
};

export type ClickUpFieldValue = {
  id: string;
  value:
    | boolean
    | number[]
    | string
    | string[]
    | {
        add: number[];
        rem: number[];
      };
};

export type PersistStartHereOptions = {
  adminMode: boolean;
  fetchImpl?: typeof fetch;
  qaMode?: boolean;
};

type ClickUpTask = {
  id: string;
  name?: string;
  custom_fields?: Array<{
    id: string;
    value?: unknown;
  }>;
};

type ClickUpConfig = {
  apiToken: string;
  listId: string;
  writeMode: "dry_run" | "live";
};

export class StartHereClickUpError extends Error {
  constructor(
    public readonly code: StartHereSubmissionErrorCode,
    message: string,
    public readonly status = 500,
    public readonly taskId?: string
  ) {
    super(message);
  }
}

export async function persistStartHereSubmission(
  values: StartHereFormValues,
  options: PersistStartHereOptions
): Promise<{
  submission: StartHerePreparedSubmission;
  persistence: StartHerePersistenceResult;
}> {
  const submissionId = globalThis.crypto.randomUUID();
  const submission = prepareStartHereSubmission(values);
  const config = getClickUpConfig(options.adminMode);

  if (config.writeMode === "dry_run") {
    return {
      submission,
      persistence: {
        submissionId,
        mode: "dry_run",
        action: "dry_run",
      },
    };
  }

  const client = new ClickUpClient(config, options.fetchImpl ?? fetch);
  const taskName = getTaskName(submission);
  const taskDescription = getTaskDescription(submission, submissionId);
  const matches = await client.findTasksByEmail(submission.fields.email);

  if (matches.length > 1) {
    throw new StartHereClickUpError(
      "CLICKUP_MATCH_COLLISION",
      "Multiple ClickUp records already use that email. We need to review this manually before routing the submission.",
      409
    );
  }

  const existingTask = matches[0];
  const taskId = existingTask
    ? await client.updateTask(existingTask.id, taskName, taskDescription)
    : await client.createTask(taskName, taskDescription);

  if (!existingTask) {
    await delay(1_000);
  }

  await client.setCustomFields(
    taskId,
    buildClickUpFieldValues(submission, { qaMode: options.qaMode === true })
  );

  return {
    submission,
    persistence: {
      submissionId,
      mode: "live",
      action: existingTask ? "updated" : "created",
      taskId,
    },
  };
}

export function buildClickUpFieldValues(
  submission: StartHerePreparedSubmission,
  options: { qaMode?: boolean } = {}
): ClickUpFieldValue[] {
  const fields = submission.fields;
  const bookedCallOwner =
    fields.bookedCallOwner === "Not assigned"
      ? []
      : [OWNER_USER_IDS[fields.bookedCallOwner]];

  return [
    { id: FIELD_IDS.firstName, value: fields.firstName },
    { id: FIELD_IDS.lastName, value: fields.lastName },
    { id: FIELD_IDS.email, value: fields.email },
    { id: FIELD_IDS.phone, value: fields.phone },
    {
      id: FIELD_IDS.leadSource,
      value: options.qaMode
        ? QA_LEAD_SOURCE_OPTION_ID
        : LEAD_SOURCE_OPTIONS[fields.leadSource],
    },
    {
      id: FIELD_IDS.leadSourceDetail,
      value: LEAD_SOURCE_DETAIL_OPTIONS[fields.leadSourceDetail],
    },
    { id: FIELD_IDS.referralDetail, value: fields.referralDetail ?? "" },
    { id: FIELD_IDS.warmOverride, value: fields.warmOverride },
    {
      id: FIELD_IDS.consideringSpecificStructure,
      value: CONSIDERING_OPTIONS[fields.consideringSpecificStructure],
    },
    {
      id: FIELD_IDS.tryingToSolve,
      value: fields.tryingToSolve.map((item) => TRYING_TO_SOLVE_OPTIONS[item]),
    },
    {
      id: FIELD_IDS.setupMaturity,
      value: SETUP_MATURITY_OPTIONS[fields.setupMaturity],
    },
    { id: FIELD_IDS.currentResidency, value: fields.currentResidence },
    {
      id: FIELD_IDS.passportsCitizenships,
      value: fields.passportsCitizenships,
    },
    {
      id: FIELD_IDS.businessMainSourceOfIncome,
      value: fields.businessMainSourceOfIncome,
    },
    {
      id: FIELD_IDS.monthlyRevenueBand,
      value: MONTHLY_REVENUE_OPTIONS[fields.monthlyRevenueBand],
    },
    {
      id: FIELD_IDS.netWorthBand,
      value: NET_WORTH_OPTIONS[fields.netWorthBand],
    },
    {
      id: FIELD_IDS.timelineToAct,
      value: TIMELINE_OPTIONS[fields.timelineToAct],
    },
    {
      id: FIELD_IDS.budgetReadiness,
      value: BUDGET_READINESS_OPTIONS[fields.budgetReadiness],
    },
    {
      id: FIELD_IDS.importantRoutingNotes,
      value: fields.importantRoutingNotes ?? "",
    },
    {
      id: FIELD_IDS.startHereFormRoute,
      value: ROUTE_OPTIONS[fields.startHereFormRoute],
    },
    {
      id: FIELD_IDS.startHereFormRouteReason,
      value: fields.startHereFormRouteReason,
    },
    {
      id: FIELD_IDS.routingDecisionSignals,
      value: fields.routingDecisionSignals.map(
        (signal) => ROUTING_SIGNAL_OPTIONS[signal]
      ),
    },
    {
      id: FIELD_IDS.bookedCallOwner,
      value: {
        add: bookedCallOwner,
        rem: Object.values(OWNER_USER_IDS).filter(
          (userId) => !bookedCallOwner.includes(userId)
        ),
      },
    },
    { id: FIELD_IDS.calComBookingId, value: fields.calComBookingId },
  ];
}

function getClickUpConfig(adminMode: boolean): ClickUpConfig {
  const writeMode = getWriteMode(adminMode);

  if (writeMode === "dry_run") {
    return {
      apiToken: "",
      listId:
        process.env["REDOMICILED_CLICKUP_CRM_LIST_ID"] ??
        REDOMICILED_CRM_LIST_ID,
      writeMode,
    };
  }

  const apiToken = process.env["REDOMICILED_CLICKUP_API_TOKEN"];

  if (!apiToken) {
    throw new StartHereClickUpError(
      "CLICKUP_CONFIG_MISSING",
      "ClickUp is not configured for this form yet."
    );
  }

  return {
    apiToken,
    listId:
      process.env["REDOMICILED_CLICKUP_CRM_LIST_ID"] ?? REDOMICILED_CRM_LIST_ID,
    writeMode,
  };
}

function getWriteMode(adminMode: boolean): "dry_run" | "live" {
  const requestedMode =
    process.env["REDOMICILED_START_HERE_WRITE_MODE"] === "live"
      ? "live"
      : "dry_run";

  if (
    adminMode &&
    process.env["REDOMICILED_START_HERE_ALLOW_ADMIN_LIVE_WRITES"] !== "true"
  ) {
    return "dry_run";
  }

  return requestedMode;
}

function getTaskName(submission: StartHerePreparedSubmission) {
  return `${submission.fields.firstName} ${submission.fields.lastName} - ${submission.fields.startHereFormRoute}`;
}

function getTaskDescription(
  submission: StartHerePreparedSubmission,
  submissionId: string
) {
  const fields = submission.fields;

  return [
    `Start Here submission: ${submissionId}`,
    "",
    `Route: ${fields.startHereFormRoute}`,
    `Route reason: ${fields.startHereFormRouteReason}`,
    `Owner: ${fields.bookedCallOwner}`,
    `Signals: ${fields.routingDecisionSignals.join(", ")}`,
    "",
    "Answers:",
    `- Source detail: ${fields.leadSourceDetail}`,
    `- Referral detail: ${fields.referralDetail ?? ""}`,
    `- Considering structure: ${fields.consideringSpecificStructure}`,
    `- Trying to solve: ${fields.tryingToSolve.join(", ")}`,
    `- Setup maturity: ${fields.setupMaturity}`,
    `- Current residency: ${fields.currentResidence}`,
    `- Passports/citizenships: ${fields.passportsCitizenships}`,
    `- Business main source of income: ${String(fields.businessMainSourceOfIncome)}`,
    `- Monthly revenue band: ${fields.monthlyRevenueBand}`,
    `- Net worth band: ${fields.netWorthBand}`,
    `- Timeline to act: ${fields.timelineToAct}`,
    `- Budget readiness: ${fields.budgetReadiness}`,
    `- Important notes: ${fields.importantRoutingNotes ?? ""}`,
  ].join("\n");
}

class ClickUpClient {
  constructor(
    private readonly config: ClickUpConfig,
    private readonly fetchImpl: typeof fetch
  ) {}

  async findTasksByEmail(email: string) {
    const matches: ClickUpTask[] = [];
    let page = 0;

    while (page < 20) {
      const data = await this.request<{ tasks?: ClickUpTask[] }>(
        `/list/${this.config.listId}/task?include_closed=true&subtasks=false&page=${page}`,
        { method: "GET" }
      );
      const tasks = data.tasks ?? [];

      matches.push(
        ...tasks.filter((task) => getTaskEmail(task) === email.toLowerCase())
      );

      if (tasks.length < 100) {
        break;
      }

      page += 1;
    }

    return matches;
  }

  async createTask(name: string, description: string) {
    const data = await this.request<{ id?: string }>(
      "/list/" + this.config.listId + "/task",
      {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          custom_item_id: REDOMICILED_LEAD_TASK_TYPE_ID,
          notify_all: false,
        }),
      }
    );

    if (!data.id) {
      throw new StartHereClickUpError(
        "CLICKUP_CREATE_FAILED",
        "ClickUp did not return a task ID after creating the submission."
      );
    }

    return data.id;
  }

  async updateTask(taskId: string, name: string, description: string) {
    await this.request(`/task/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({
        name,
        description,
      }),
    });

    return taskId;
  }

  async setCustomFields(taskId: string, fields: ClickUpFieldValue[]) {
    const failed: string[] = [];

    for (const field of fields) {
      try {
        await this.request(`/task/${taskId}/field/${field.id}`, {
          method: "POST",
          body: JSON.stringify({ value: field.value }),
        });
      } catch (error) {
        failed.push(
          error instanceof StartHereClickUpError
            ? `${field.id} (${error.message})`
            : field.id
        );
      }
    }

    if (failed.length > 0) {
      throw new StartHereClickUpError(
        "CLICKUP_FIELD_UPDATE_FAILED",
        `ClickUp task was created or updated, but ${failed.length} custom field update(s) failed: ${failed.join(", ")}.`,
        502,
        taskId
      );
    }
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    let response: Response | undefined;

    for (let attempt = 0; attempt < 4; attempt += 1) {
      response = await this.fetchImpl(`${CLICKUP_API_BASE_URL}${path}`, {
        ...init,
        headers: {
          Authorization: this.config.apiToken,
          "Content-Type": "application/json",
          ...init.headers,
        },
      });

      if (response.ok || !shouldRetryClickUpRequest(response.status)) {
        break;
      }

      await delay(250 * 2 ** attempt);
    }

    if (!response?.ok) {
      const responseBody = response ? await response.text() : "";
      throw new StartHereClickUpError(
        "CLICKUP_REQUEST_FAILED",
        `ClickUp request failed with status ${response?.status ?? "unknown"}${responseBody ? `: ${responseBody}` : ""}.`,
        502
      );
    }

    return (await response.json()) as T;
  }
}

function shouldRetryClickUpRequest(status: number) {
  return status === 429 || status >= 500;
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getTaskEmail(task: ClickUpTask) {
  const field = task.custom_fields?.find((item) => item.id === FIELD_IDS.email);
  const value = field?.value;

  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }

  if (
    value &&
    typeof value === "object" &&
    "email" in value &&
    typeof value.email === "string"
  ) {
    return value.email.trim().toLowerCase();
  }

  return "";
}
