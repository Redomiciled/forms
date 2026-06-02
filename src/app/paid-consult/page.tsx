import type { Metadata } from "next";

import { PaidConsultFlow } from "@/components/paid-consult/paid-consult-flow";
import { getPaidConsultOwnerFromClickUpTask } from "@/lib/paid-consult-clickup";
import {
  getFirstSearchParam,
  getPaidConsultConfig,
  parsePaidConsultPreviewState,
  parsePaidConsultTaskId,
} from "@/lib/paid-consult";

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
  const bookedCallOwner = taskId
    ? await getPaidConsultOwnerFromClickUpTask(taskId).catch(
        () => "Will" as const
      )
    : "Will";

  return (
    <main className="relative min-h-dvh bg-[#070720] lg:h-dvh lg:overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(92,89,255,0.42),transparent_32%),radial-gradient(circle_at_80%_12%,rgba(59,56,224,0.36),transparent_30%),linear-gradient(135deg,#2422A1_0%,#3B38E0_48%,#11102B_100%)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(125deg,transparent_0%,rgba(255,255,255,0.13)_46%,transparent_70%)] opacity-35" />
      <div className="relative lg:h-full">
        <PaidConsultFlow
          config={getPaidConsultConfig({ bookedCallOwner })}
          hasInvalidTaskId={Boolean(rawTaskId && !taskId)}
          previewState={previewStep}
          taskId={taskId}
        />
      </div>
    </main>
  );
}
