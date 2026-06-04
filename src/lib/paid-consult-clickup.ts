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

type PaidConsultClickUpTask = {
  custom_fields?: PaidConsultClickUpCustomField[];
};

export type PaidConsultClickUpContext = {
  bookedCallOwner: PaidConsultOwner;
  prefill: PaidConsultPrefill;
};

type PaidConsultClickUpConfig = {
  apiToken: string;
};

export async function getPaidConsultOwnerFromClickUpTask(
  taskId: string,
  options: { fetchImpl?: typeof fetch } = {}
): Promise<PaidConsultOwner> {
  const context = await getPaidConsultContextFromClickUpTask(taskId, options);
  return context.bookedCallOwner;
}

export async function getPaidConsultContextFromClickUpTask(
  taskId: string,
  options: { fetchImpl?: typeof fetch } = {}
): Promise<PaidConsultClickUpContext> {
  const config = getPaidConsultClickUpConfig();
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
    return getDefaultPaidConsultContext();
  }

  const task = (await response.json()) as PaidConsultClickUpTask;
  return {
    bookedCallOwner: resolvePaidConsultOwnerFromCustomFields(
      task.custom_fields
    ),
    prefill: resolvePaidConsultPrefillFromCustomFields(task.custom_fields),
  };
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
    bookedCallOwner: "Will",
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
