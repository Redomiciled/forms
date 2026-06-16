import {
  resolvePaidConsultOwnerFromCustomFields,
  type PaidConsultClickUpCustomField,
  type PaidConsultOwner,
  type PaidConsultPrefill,
} from "./paid-consult";

const CLICKUP_API_BASE_URL = "https://api.clickup.com/api/v2";

const PAID_CONSULT_PREFILL_FIELD_IDS = {
  firstName: "b6b2590d-58a3-463b-8e38-691c791e0f7f",
  lastName: "c63b5e5a-220f-49f2-8b0f-1da4137139d1",
  email: "cfe207d1-c5a3-47b7-bd72-eae0d5c0c708",
} as const;
const PAID_CONSULT_STATUS_COMPLETE = "consult paid";
const PAID_CONSULT_BOOKING_ID_FIELD_ID = "6a623f65-673a-474e-b9e3-55ea84e70648";
const PAID_CONSULT_PAYMENT_STATUS_FIELD_ID =
  "181cec27-70eb-4e61-a49f-82ed850103a2";
const PAID_CONSULT_PAYMENT_STATUS_PAID_OPTION_ID =
  "3f6cda12-61d1-4141-aa78-41b9b474a15a";
const PAID_CONSULT_MEETING_URL_FIELD_ID =
  "3abc3411-d87a-48ec-a8d3-452bef94bf83";

type PaidConsultClickUpTask = {
  status?: string | { status?: string };
  custom_fields?: PaidConsultClickUpCustomField[];
};

export type PaidConsultClickUpContext = {
  paidConsultOwner: PaidConsultOwner;
  prefill: PaidConsultPrefill;
};

export type PaidConsultCompletionStatus = {
  completed: boolean;
  meetingUrl: string;
  paidConsultBookingId: string;
  paymentStatus: string;
  reason: "paid" | "pending" | "unavailable";
  status: string;
};

type PaidConsultClickUpConfig = {
  apiToken: string;
};

export async function getPaidConsultOwnerFromClickUpTask(
  taskId: string,
  options: { fetchImpl?: typeof fetch } = {}
): Promise<PaidConsultOwner> {
  const context = await getPaidConsultContextFromClickUpTask(taskId, options);
  return context.paidConsultOwner;
}

export async function getPaidConsultContextFromClickUpTask(
  taskId: string,
  options: { fetchImpl?: typeof fetch } = {}
): Promise<PaidConsultClickUpContext> {
  const task = await getPaidConsultTask(taskId, options);

  if (!task) {
    return getDefaultPaidConsultContext();
  }

  return {
    paidConsultOwner: resolvePaidConsultOwnerFromCustomFields(
      task.custom_fields
    ),
    prefill: resolvePaidConsultPrefillFromCustomFields(task.custom_fields),
  };
}

export async function getPaidConsultCompletionFromClickUpTask(
  taskId: string,
  options: { fetchImpl?: typeof fetch } = {}
): Promise<PaidConsultCompletionStatus> {
  const task = await getPaidConsultTask(taskId, options);

  if (!task) {
    return {
      completed: false,
      meetingUrl: "",
      paidConsultBookingId: "",
      paymentStatus: "",
      reason: "unavailable",
      status: "",
    };
  }

  const customFields = task.custom_fields;
  const status = normalizeText(getTaskStatus(task));
  const paidConsultBookingId = getTextCustomFieldValue(
    customFields,
    PAID_CONSULT_BOOKING_ID_FIELD_ID,
    "Paid Consult Booking ID"
  );
  const paymentStatus = getDropdownCustomFieldLabel(
    customFields,
    PAID_CONSULT_PAYMENT_STATUS_FIELD_ID,
    "Payment Status"
  );
  const meetingUrl = getTextCustomFieldValue(
    customFields,
    PAID_CONSULT_MEETING_URL_FIELD_ID,
    "Meeting URL"
  );
  const paymentStatusIsPaid =
    normalizeText(paymentStatus) === "paid" ||
    getRawCustomFieldValue(
      customFields,
      PAID_CONSULT_PAYMENT_STATUS_FIELD_ID,
      "Payment Status"
    ) === PAID_CONSULT_PAYMENT_STATUS_PAID_OPTION_ID;
  const completed = Boolean(
    status === PAID_CONSULT_STATUS_COMPLETE &&
    paymentStatusIsPaid &&
    paidConsultBookingId
  );

  return {
    completed,
    meetingUrl,
    paidConsultBookingId,
    paymentStatus,
    reason: completed ? "paid" : "pending",
    status,
  };
}

async function getPaidConsultTask(
  taskId: string,
  options: { fetchImpl?: typeof fetch } = {}
): Promise<PaidConsultClickUpTask | null> {
  const config = getPaidConsultClickUpConfig();

  if (!config.apiToken) {
    return null;
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const response = await fetchImpl(
    `${CLICKUP_API_BASE_URL}/task/${encodeURIComponent(taskId)}`,
    {
      headers: {
        Authorization: config.apiToken,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 },
    } as RequestInit
  );

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as PaidConsultClickUpTask;
}

function getPaidConsultClickUpConfig(): PaidConsultClickUpConfig {
  const apiToken = process.env["REDOMICILED_CLICKUP_API_TOKEN"];

  if (!apiToken) {
    return { apiToken: "" };
  }

  return { apiToken };
}

function getDefaultPaidConsultContext(): PaidConsultClickUpContext {
  return {
    paidConsultOwner: "Will",
    prefill: {},
  };
}

function resolvePaidConsultPrefillFromCustomFields(
  customFields: PaidConsultClickUpCustomField[] | undefined
): PaidConsultPrefill {
  const firstName = getTextCustomFieldValue(
    customFields,
    PAID_CONSULT_PREFILL_FIELD_IDS.firstName,
    "First Name"
  );
  const lastName = getTextCustomFieldValue(
    customFields,
    PAID_CONSULT_PREFILL_FIELD_IDS.lastName,
    "Last Name"
  );
  const email = normalizeEmail(
    getTextCustomFieldValue(
      customFields,
      PAID_CONSULT_PREFILL_FIELD_IDS.email,
      "Email"
    )
  );
  const name = [firstName, lastName].filter(Boolean).join(" ");

  return {
    ...(email ? { email } : {}),
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    ...(name ? { name } : {}),
  };
}

function getTextCustomFieldValue(
  customFields: PaidConsultClickUpCustomField[] | undefined,
  fieldId: string,
  fieldName: string
) {
  const field = customFields?.find(
    (candidate) => candidate.id === fieldId || candidate.name === fieldName
  );

  return textValue(field?.value);
}

function getDropdownCustomFieldLabel(
  customFields: PaidConsultClickUpCustomField[] | undefined,
  fieldId: string,
  fieldName: string
) {
  const field = findCustomField(customFields, fieldId, fieldName);
  const rawValue = field?.value;
  const options =
    (field as PaidConsultClickUpCustomFieldWithOptions | undefined)?.type_config
      ?.options ?? [];
  const option = options.find((item) => {
    return (
      item.id === rawValue ||
      item.name === rawValue ||
      item.orderindex === rawValue
    );
  });

  return textValue(option?.name ?? rawValue);
}

function getRawCustomFieldValue(
  customFields: PaidConsultClickUpCustomField[] | undefined,
  fieldId: string,
  fieldName: string
) {
  return findCustomField(customFields, fieldId, fieldName)?.value;
}

function findCustomField(
  customFields: PaidConsultClickUpCustomField[] | undefined,
  fieldId: string,
  fieldName: string
) {
  return customFields?.find(
    (candidate) => candidate.id === fieldId || candidate.name === fieldName
  );
}

type PaidConsultClickUpCustomFieldWithOptions =
  PaidConsultClickUpCustomField & {
    type_config?: {
      options?: Array<{
        id?: string;
        name?: string;
        orderindex?: number | string;
      }>;
    };
  };

function getTaskStatus(task: PaidConsultClickUpTask) {
  if (typeof task.status === "string") {
    return task.status;
  }

  return task.status?.status ?? "";
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function textValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    return textValue(record["value"] ?? record["text"] ?? record["name"]);
  }

  return "";
}

function normalizeEmail(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!normalized || /\s/.test(normalized) || !normalized.includes("@")) {
    return "";
  }

  return normalized;
}
