import {
  resolvePaidConsultOwnerFromCustomFields,
  type PaidConsultClickUpCustomField,
  type PaidConsultOwner,
} from "./paid-consult";

const CLICKUP_API_BASE_URL = "https://api.clickup.com/api/v2";

type PaidConsultClickUpTask = {
  custom_fields?: PaidConsultClickUpCustomField[];
};

type PaidConsultClickUpConfig = {
  apiToken: string;
};

export async function getPaidConsultOwnerFromClickUpTask(
  taskId: string,
  options: { fetchImpl?: typeof fetch } = {}
): Promise<PaidConsultOwner> {
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
    return "Will";
  }

  const task = (await response.json()) as PaidConsultClickUpTask;
  return resolvePaidConsultOwnerFromCustomFields(task.custom_fields);
}

function getPaidConsultClickUpConfig(): PaidConsultClickUpConfig {
  const apiToken = process.env["REDOMICILED_CLICKUP_API_TOKEN"];

  if (!apiToken) {
    return { apiToken: "" };
  }

  return { apiToken };
}
