import type { Metadata } from "next";

import { PaidConsultFlow } from "@/components/paid-consult/paid-consult-flow";
import {
  getFirstSearchParam,
  getPaidConsultConfig,
  parsePaidConsultPreviewState,
  parsePaidConsultTaskId,
} from "@/lib/paid-consult";
import { getPaidConsultContextFromClickUpTask } from "@/lib/paid-consult-clickup";

type PaidConsultSearchParams = Promise<{
  id?: string | string[];
  [key: string]: string | string[] | undefined;
}>;

export const metadata: Metadata = {
  title: "Paid Consult | Redomiciled",
  description: "Complete your Redomiciled agreement and paid consult booking.",
};

export default async function PaidConsultPage({
  searchParams,
}: {
  searchParams: PaidConsultSearchParams;
}) {
  const params = await searchParams;
  const rawTaskId = getFirstSearchParam(params.id)?.trim() ?? "";
  const taskId = parsePaidConsultTaskId(params.id);
  const previewStep =
    process.env.NODE_ENV === "production"
      ? null
      : parsePaidConsultPreviewState(
          params["previewState"] ?? params["previewStep"]
        );
  const taskContext = taskId
    ? await getPaidConsultContextFromClickUpTask(taskId)
    : null;
  const paidConsultOwner = taskContext?.paidConsultOwner ?? "Will";

  return (
    <main className="bg-paper text-ink min-h-dvh lg:h-dvh lg:overflow-hidden">
      <PaidConsultFlow
        config={getPaidConsultConfig({ paidConsultOwner })}
        hasInvalidTaskId={Boolean(rawTaskId && !taskId)}
        prefill={taskContext?.prefill ?? null}
        previewState={previewStep}
        taskId={taskId}
      />
    </main>
  );
}
