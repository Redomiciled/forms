import {
  prepareStartHereSubmission,
  type RoutingDecisionSignal,
  type ServicePath,
  type StartHereFormRoute,
  type StartHereFormValues,
  type StartHerePreparedSubmission,
} from "./start-here";
import {
  type StartHerePersistenceResult,
  type StartHereSubmissionErrorCode,
  type StartHereSubmissionSource,
} from "./start-here-submission";

const CLICKUP_API_BASE_URL = "https://api.clickup.com/api/v2";
const CLICKUP_CUSTOM_FIELD_UPDATE_CONCURRENCY = 6;

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

const OWNER_USER_IDS = {
  Will: 296457746,
  Erik: 99702565,
} as const;

const QA_LEAD_SOURCE = "Test (Ignore)";

const ROUTE_OPTIONS = {
  "Unqualified / Not Ready": "ddc9bb23-b40a-44e8-9d69-2387a2d0752e",
  "Booked Call": "ed6fe3c3-d74e-4d71-90d4-5882eb16a7f6",
  "Manual Triage": "05d90179-eaea-4880-930f-8134a683b5f5",
} as const;

const NATIVE_STATUS_BY_ROUTE: Record<StartHereFormRoute, string> = {
  "Booked Call": "START HERE SUBMITTED",
  "Manual Triage": "MANUAL TRIAGE",
  "Unqualified / Not Ready": "NOT READY",
};

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

const SERVICE_PATH_OPTIONS: Record<ServicePath, string> = {
  Banking: "83b016f6-27e2-4211-9a69-4e50d5caf066",
  "Bespoke plan": "d5bcdf8f-e800-4d33-b6c0-7f4a830297b0",
  "Other / manual review": "7a457ec8-5484-42be-86a1-1ca0578682a1",
  Unknown: "a6623135-d2a7-43b3-8013-c52a77562f88",
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

type ClickUpAssigneeUpdate = {
  add: number[];
  rem: number[];
};

export type PersistStartHereOptions = {
  fetchImpl?: typeof fetch;
  qaMode?: boolean;
  source?: StartHereSubmissionSource;
  taskId?: string;
};

type ClickUpConfig = {
  apiToken: string;
  listId: string;
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
  const submission = prepareStartHereSubmission(values, {
    leadSource: getLeadSourceFromSubmissionSource(options.source),
  });
  const config = getClickUpConfig();

  const client = new ClickUpClient(config, options.fetchImpl ?? fetch);
  const taskName = getTaskName(submission);
  const taskDescription = getTaskDescription(submission, submissionId);
  const taskStatus = getNativeClickUpStatus(
    submission.fields.startHereFormRoute
  );
  const assigneeUserIds = getOwnerUserIds(submission);
  const assigneeUpdate = getOwnerAssigneeUpdate(assigneeUserIds);
  const customFields = buildClickUpFieldValues(submission, {
    qaMode: options.qaMode === true,
  });
  const existingTaskId = options.taskId;
  const action = existingTaskId ? "updated" : "created";
  const taskId = existingTaskId
    ? await client.updateTask(
        existingTaskId,
        taskName,
        taskDescription,
        taskStatus,
        assigneeUpdate,
        customFields
      )
    : await client.createTask(
        taskName,
        taskDescription,
        taskStatus,
        assigneeUserIds,
        customFields
      );

  return {
    submission,
    persistence: {
      submissionId,
      mode: "live",
      action,
      taskId,
    },
  };
}

export function buildClickUpFieldValues(
  submission: StartHerePreparedSubmission,
  options: { qaMode?: boolean } = {}
): ClickUpFieldValue[] {
  const fields = submission.fields;
  const bookedCallOwner = getOwnerUserIds(submission);
  const paidConsultOwner: number[] = [OWNER_USER_IDS.Will];

  return [
    { id: FIELD_IDS.firstName, value: fields.firstName },
    { id: FIELD_IDS.lastName, value: fields.lastName },
    { id: FIELD_IDS.email, value: fields.email },
    { id: FIELD_IDS.phone, value: fields.phone },
    {
      id: FIELD_IDS.leadSource,
      value: options.qaMode ? QA_LEAD_SOURCE : fields.leadSource,
    },
    { id: FIELD_IDS.startHereAnswers, value: getStartHereAnswersJson(fields) },
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
      id: FIELD_IDS.servicePath,
      value: SERVICE_PATH_OPTIONS[fields.servicePath],
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
    {
      id: FIELD_IDS.paidConsultOwner,
      value: {
        add: paidConsultOwner,
        rem: Object.values(OWNER_USER_IDS).filter(
          (userId) => !paidConsultOwner.includes(userId)
        ),
      },
    },
    { id: FIELD_IDS.calComBookingId, value: fields.calComBookingId },
  ];
}

export function getNativeClickUpStatus(route: StartHereFormRoute) {
  return NATIVE_STATUS_BY_ROUTE[route];
}

function getStartHereAnswersJson(
  fields: StartHerePreparedSubmission["fields"]
) {
  return JSON.stringify(
    {
      schema: "redomiciled.start_here_answers.v1",
      answers: [
        {
          key: "leadSourceDetail",
          label: "Lead Source Detail",
          value: fields.leadSourceDetail,
        },
        {
          key: "referralDetail",
          label: "Referral Detail",
          value: fields.referralDetail ?? "",
        },
        {
          key: "warmOverride",
          label: "Warm Override",
          value: fields.warmOverride,
        },
        {
          key: "consideringSpecificStructure",
          label: "Considering Specific Structure",
          value: fields.consideringSpecificStructure,
        },
        {
          key: "tryingToSolve",
          label: "Trying To Solve",
          value: fields.tryingToSolve,
        },
        {
          key: "setupMaturity",
          label: "Setup Maturity",
          value: fields.setupMaturity,
        },
        {
          key: "currentResidence",
          label: "Current Residency",
          value: fields.currentResidence,
        },
        {
          key: "passportsCitizenships",
          label: "Passports / Citizenships",
          value: fields.passportsCitizenships,
        },
        {
          key: "businessMainSourceOfIncome",
          label: "Business Main Source Of Income",
          value: fields.businessMainSourceOfIncome,
        },
        {
          key: "monthlyRevenueBand",
          label: "Monthly Revenue Band",
          value: fields.monthlyRevenueBand,
        },
        {
          key: "netWorthBand",
          label: "Net Worth Band",
          value: fields.netWorthBand,
        },
        {
          key: "timelineToAct",
          label: "Timeline To Act",
          value: fields.timelineToAct,
        },
        {
          key: "budgetReadiness",
          label: "Budget Readiness",
          value: fields.budgetReadiness,
        },
        {
          key: "importantRoutingNotes",
          label: "Important Routing Notes",
          value: fields.importantRoutingNotes ?? "",
        },
      ],
    },
    null,
    2
  );
}

function getLeadSourceFromSubmissionSource(
  source: StartHereSubmissionSource | undefined
) {
  return source === undefined ? "Start Here Form" : source;
}

function getOwnerUserIds(submission: StartHerePreparedSubmission) {
  const owner = submission.fields.bookedCallOwner;

  return owner === "Not assigned" ? [] : [OWNER_USER_IDS[owner]];
}

function getOwnerAssigneeUpdate(ownerUserIds: number[]): ClickUpAssigneeUpdate {
  return {
    add: ownerUserIds,
    rem: Object.values(OWNER_USER_IDS).filter(
      (userId) => !ownerUserIds.includes(userId)
    ),
  };
}

function getClickUpConfig(): ClickUpConfig {
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
  };
}

function getTaskName(submission: StartHerePreparedSubmission) {
  return `${submission.fields.firstName} ${submission.fields.lastName} - ${submission.fields.startHereFormRoute}`;
}

function getTaskDescription(
  submission: StartHerePreparedSubmission,
  _submissionId: string
) {
  const fields = submission.fields;

  return [
    `**Route:** ${fields.startHereFormRoute}`,
    `**Route reason:** ${fields.startHereFormRouteReason}`,
    `**Owner:** ${fields.bookedCallOwner}`,
    `**Signals:** ${fields.routingDecisionSignals.join(", ")}`,
    "",
    "### Answers",
    `- **Source detail:** ${fields.leadSourceDetail}`,
    `- **Referral detail:** ${fields.referralDetail ?? ""}`,
    `- **Considering structure:** ${fields.consideringSpecificStructure}`,
    `- **Trying to solve:** ${fields.tryingToSolve.join(", ")}`,
    `- **Setup maturity:** ${fields.setupMaturity}`,
    `- **Current residency:** ${fields.currentResidence}`,
    `- **Passports/citizenships:** ${fields.passportsCitizenships}`,
    `- **Business main source of income:** ${String(fields.businessMainSourceOfIncome)}`,
    `- **Monthly revenue band:** ${fields.monthlyRevenueBand}`,
    `- **Net worth band:** ${fields.netWorthBand}`,
    `- **Timeline to act:** ${fields.timelineToAct}`,
    `- **Budget readiness:** ${fields.budgetReadiness}`,
    `- **Important notes:** ${fields.importantRoutingNotes ?? ""}`,
  ].join("\n");
}

class ClickUpClient {
  constructor(
    private readonly config: ClickUpConfig,
    private readonly fetchImpl: typeof fetch
  ) {}

  async createTask(
    name: string,
    description: string,
    status: string,
    assignees: number[],
    customFields: ClickUpFieldValue[]
  ) {
    const data = await this.request<{ id?: string }>(
      "/list/" + this.config.listId + "/task",
      {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          status,
          custom_item_id: REDOMICILED_LEAD_TASK_TYPE_ID,
          ...(assignees.length > 0 ? { assignees } : {}),
          custom_fields: customFields,
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

  async updateTask(
    taskId: string,
    name: string,
    description: string,
    status: string,
    assignees: ClickUpAssigneeUpdate,
    customFields: ClickUpFieldValue[]
  ) {
    await this.request<Record<string, unknown>>("/task/" + taskId, {
      method: "PUT",
      body: JSON.stringify({
        name,
        description,
        status,
        assignees,
      }),
    });

    await runWithConcurrency(
      customFields,
      CLICKUP_CUSTOM_FIELD_UPDATE_CONCURRENCY,
      async (field) => {
        await this.request<Record<string, unknown>>(
          "/task/" + taskId + "/field/" + field.id,
          {
            method: "POST",
            body: JSON.stringify({ value: field.value }),
          }
        );
      }
    );

    return taskId;
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

    const responseText = await response.text();

    if (!responseText) {
      return {} as T;
    }

    return JSON.parse(responseText) as T;
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

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  handler: (item: T) => Promise<void>
) {
  const workerCount = Math.min(concurrency, items.length);

  await Promise.all(
    Array.from({ length: workerCount }, async (_, workerIndex) => {
      for (
        let index = workerIndex;
        index < items.length;
        index += workerCount
      ) {
        await handler(items[index]!);
      }
    })
  );
}
