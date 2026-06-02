export type PaidConsultConfig = {
  bookedCallOwner: PaidConsultOwner;
  tallyFormId: string;
  calLink: string;
};

export type PaidConsultOwner = "Erik" | "Will";

export type PaidConsultStep = 1 | 2;

export type PaidConsultPreviewState = PaidConsultStep | "complete";

export type PaidConsultCalInlineConfig = Record<`metadata[${string}]`, string>;

export type PaidConsultCalEmbedOptions = {
  calLink: string;
  config: PaidConsultCalInlineConfig;
};

export const paidConsultOriginPage = "/paid-consult";
export const paidConsultSource = "paid-consult";
export const paidConsultBookedCallOwnerFieldId =
  "580ba4f1-6479-4255-a0c5-be049e3b4e21";
export const paidConsultOwnerUserIds: Record<PaidConsultOwner, number> = {
  Erik: 99702565,
  Will: 296457746,
};
export const paidConsultCalLinks: Record<PaidConsultOwner, string> = {
  Erik: "https://cal.com/erik-redomiciled/paid-consult",
  Will: "https://cal.com/william-denton-redomiciled/paid-consult",
};
export const paidConsultTallyFormId = "PdOAkB";

const taskIdPattern = /^[A-Za-z0-9_-]{3,128}$/;

export function getPaidConsultConfig({
  bookedCallOwner = "Will",
}: {
  bookedCallOwner?: PaidConsultOwner;
} = {}): PaidConsultConfig {
  return {
    bookedCallOwner,
    tallyFormId:
      cleanConfigValue(
        process.env["NEXT_PUBLIC_REDOMICILED_PAID_CONSULT_TALLY_FORM_ID"]
      ) || paidConsultTallyFormId,
    calLink: normalizeCalLink(paidConsultCalLinks[bookedCallOwner]),
  };
}

export function getFirstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parsePaidConsultTaskId(value: string | string[] | undefined) {
  const candidate = getFirstSearchParam(value)?.trim();

  if (!candidate || !taskIdPattern.test(candidate)) {
    return null;
  }

  return candidate;
}

export function parsePaidConsultPreviewState(
  value: string | string[] | undefined
): PaidConsultPreviewState | null {
  const candidate = getFirstSearchParam(value)?.trim();

  if (candidate === "1" || candidate === "2") {
    return Number(candidate) as PaidConsultStep;
  }

  if (candidate === "3" || candidate === "complete") {
    return "complete";
  }

  return null;
}

export function isPaidConsultConfigured(config: PaidConsultConfig) {
  return Boolean(config.tallyFormId && config.calLink);
}

export function buildTallyMsaEmbedUrl({
  formId,
  taskId,
}: {
  formId: string;
  taskId: string;
}) {
  const url = new URL(`https://tally.so/embed/${encodeURIComponent(formId)}`);

  url.searchParams.set("alignLeft", "1");
  url.searchParams.set("hideTitle", "1");
  url.searchParams.set("transparentBackground", "1");
  url.searchParams.set("dynamicHeight", "1");
  url.searchParams.set("id", taskId);
  url.searchParams.set("source", paidConsultSource);
  url.searchParams.set("originPage", paidConsultOriginPage);

  return url.toString();
}

export function getPaidConsultCalEmbedOptions({
  bookedCallOwner,
  calLink,
  taskId,
}: {
  bookedCallOwner: PaidConsultOwner;
  calLink: string;
  taskId: string;
}): PaidConsultCalEmbedOptions | null {
  const normalizedCalLink = normalizeCalLink(calLink);

  if (!normalizedCalLink) {
    return null;
  }

  return {
    calLink: normalizedCalLink,
    config: toCalMetadataConfig({
      source: paidConsultSource,
      clickUpTaskId: taskId,
      bookedCallOwner,
      originPage: paidConsultOriginPage,
    }),
  };
}

export type PaidConsultClickUpCustomField = {
  id?: string;
  name?: string;
  value?: unknown;
};

export function resolvePaidConsultOwnerFromCustomFields(
  customFields: PaidConsultClickUpCustomField[] | undefined
): PaidConsultOwner {
  const ownerField = customFields?.find(
    (field) => field.id === paidConsultBookedCallOwnerFieldId
  );
  const userIds = extractClickUpPeopleUserIds(ownerField?.value);

  if (userIds.includes(paidConsultOwnerUserIds.Erik)) {
    return "Erik";
  }

  return "Will";
}

export function normalizeCalLink(value: string | undefined) {
  const trimmed = cleanConfigValue(value);

  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(trimmed);

    if (url.hostname !== "cal.com" && url.hostname !== "app.cal.com") {
      return "";
    }

    return stripCalLink(url.pathname);
  } catch {
    return stripCalLink(trimmed);
  }
}

function cleanConfigValue(value: string | undefined) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed || trimmed.startsWith("PLACEHOLDER_")) {
    return "";
  }

  return trimmed;
}

function stripCalLink(value: string) {
  return (
    value
      .split("?")[0]
      ?.replace(/^https?:\/\//, "")
      .replace(/^(app\.)?cal\.com\//, "")
      .replace(/^\/|\/$/g, "") ?? ""
  );
}

function extractClickUpPeopleUserIds(value: unknown): number[] {
  if (typeof value === "number") {
    return [value];
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? [parsed] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractClickUpPeopleUserIds(item));
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return [
      ...extractClickUpPeopleUserIds(record["id"]),
      ...extractClickUpPeopleUserIds(record["user_id"]),
      ...extractClickUpPeopleUserIds(record["userid"]),
      ...extractClickUpPeopleUserIds(record["user"] ?? record["member"]),
    ];
  }

  return [];
}

function toCalMetadataConfig(values: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(values)
      .filter((entry): entry is [string, string] => Boolean(entry[1]))
      .map(([key, value]) => [`metadata[${key}]`, value])
  ) as PaidConsultCalInlineConfig;
}
