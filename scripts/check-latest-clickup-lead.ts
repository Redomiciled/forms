const CLICKUP_API_BASE_URL = "https://api.clickup.com/api/v2";
const REDOMICILED_CRM_LIST_ID = "901217458864";

const FIELD_IDS = {
  firstName: "b6b2590d-58a3-463b-8e38-691c791e0f7f",
  lastName: "c63b5e5a-220f-49f2-8b0f-1da4137139d1",
  email: "cfe207d1-c5a3-47b7-bd72-eae0d5c0c708",
  phone: "3a356107-fadc-41c2-90fd-46b4af007fdf",
  leadSource: "ca71b224-d78d-4b83-ac83-f78a6ac50054",
  startHereFormRoute: "0ed775f3-ae23-43ea-8f70-d1ecd161a301",
  bookedCallOwner: "580ba4f1-6479-4255-a0c5-be049e3b4e21",
  calComBookingId: "7d5007ea-07e9-4796-a656-49e8548a032c",
} as const;

const FIELD_LABELS: Record<string, string> = {
  [FIELD_IDS.firstName]: "First Name",
  [FIELD_IDS.lastName]: "Last Name",
  [FIELD_IDS.email]: "Email",
  [FIELD_IDS.phone]: "Phone",
  [FIELD_IDS.leadSource]: "Lead Source",
  [FIELD_IDS.startHereFormRoute]: "Start Here Form Route",
  [FIELD_IDS.bookedCallOwner]: "Booked Call Owner",
  [FIELD_IDS.calComBookingId]: "Cal.com Booking ID",
};

async function main() {
  const apiToken = process.env["REDOMICILED_CLICKUP_API_TOKEN"];
  const listId =
    process.env["REDOMICILED_CLICKUP_CRM_LIST_ID"] ?? REDOMICILED_CRM_LIST_ID;
  const limit = getLimit();

  if (!apiToken) {
    throw new Error("Missing REDOMICILED_CLICKUP_API_TOKEN.");
  }

  const data = await clickUpRequest<ClickUpTasksResponse>(
    apiToken,
    `/list/${listId}/task?include_closed=true&subtasks=false&order_by=created&reverse=true&page=0`
  );
  const tasks = data.tasks
    .toSorted((left, right) => getCreatedAt(right) - getCreatedAt(left))
    .slice(0, limit);

  if (tasks.length === 0) {
    console.log(`No tasks found in ClickUp list ${listId}.`);
    return;
  }

  for (const task of tasks) {
    printTaskSummary(task);
  }
}

function getLimit() {
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.slice("--limit=".length)) : 3;

  if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
    throw new Error("--limit must be an integer from 1 to 20.");
  }

  return limit;
}

async function clickUpRequest<T>(apiToken: string, path: string): Promise<T> {
  const response = await fetch(`${CLICKUP_API_BASE_URL}${path}`, {
    headers: {
      Authorization: apiToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `ClickUp request failed with ${response.status}${body ? `: ${body}` : ""}`
    );
  }

  return (await response.json()) as T;
}

function printTaskSummary(task: ClickUpTask) {
  console.log("");
  console.log(`${task.name} (${task.id})`);
  console.log(`URL: ${task.url}`);
  console.log(`Status: ${task.status.status}`);
  console.log(`Created: ${formatClickUpDate(task.date_created)}`);

  for (const [fieldId, label] of Object.entries(FIELD_LABELS)) {
    console.log(`${label}: ${formatFieldValue(getCustomField(task, fieldId))}`);
  }
}

function getCustomField(task: ClickUpTask, fieldId: string) {
  return task.custom_fields.find((field) => field.id === fieldId);
}

function formatFieldValue(field: ClickUpCustomField | undefined) {
  if (!field || field.value === undefined || field.value === null) {
    return "";
  }

  if (Array.isArray(field.value)) {
    return field.value
      .map((value) => formatFieldEntry(field, value))
      .join(", ");
  }

  return formatFieldEntry(field, field.value);
}

function formatFieldEntry(field: ClickUpCustomField, value: unknown): string {
  const option = field.type_config?.options?.find(
    (item) => item.id === value || item.orderindex === value
  );

  if (option) {
    return option.name;
  }

  if (value && typeof value === "object") {
    if ("username" in value && typeof value.username === "string") {
      return value.username;
    }

    if ("email" in value && typeof value.email === "string") {
      return value.email;
    }

    return JSON.stringify(value);
  }

  return String(value);
}

function formatClickUpDate(value?: string) {
  if (!value) {
    return "";
  }

  const timestamp = Number(value);

  if (!Number.isFinite(timestamp)) {
    return value;
  }

  return new Date(timestamp).toISOString();
}

function getCreatedAt(task: ClickUpTask) {
  const timestamp = Number(task.date_created);

  return Number.isFinite(timestamp) ? timestamp : 0;
}

type ClickUpTasksResponse = {
  tasks: ClickUpTask[];
};

type ClickUpTask = {
  id: string;
  name: string;
  url: string;
  date_created?: string;
  status: {
    status: string;
  };
  custom_fields: ClickUpCustomField[];
};

type ClickUpCustomField = {
  id: string;
  name: string;
  value?: unknown;
  type_config?: {
    options?: Array<{
      id: string;
      name: string;
      orderindex?: number;
    }>;
  };
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
