import type { StartHereFormValues } from "@/lib/start-here";

import { SummaryItem } from "../fields";

export function ReviewStep({
  values,
  errors,
}: {
  values: StartHereFormValues;
  errors: Partial<Record<keyof StartHereFormValues, string>>;
}) {
  const errorEntries = Object.entries(errors);

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border border-white/12 bg-white/8 p-5">
        <h3 className="text-lg font-semibold">Review before preparing</h3>
        <p className="mt-2 text-sm leading-6 text-white/65">
          The next action prepares a local ClickUp payload. It does not submit
          to a webhook, create ClickUp records, or display a live calendar.
        </p>
      </div>
      {errorEntries.length > 0 ? (
        <div className="rounded-2xl border border-rose-300/30 bg-rose-500/12 p-4 text-sm text-rose-100">
          <p className="font-semibold">Required answers missing</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errorEntries.map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <SummaryItem
          label="Name"
          value={`${values.firstName} ${values.lastName}`}
        />
        <SummaryItem label="Email" value={values.email} />
        <SummaryItem label="Source" value={values.leadSourceDetail} />
        <SummaryItem
          label="Intent"
          value={values.tryingToSolve.join(", ") || "Not selected"}
        />
        <SummaryItem label="Setup" value={values.setupMaturity} />
        <SummaryItem label="Timeline" value={values.timelineToAct} />
        <SummaryItem label="Net worth" value={values.netWorthBand} />
        <SummaryItem label="Budget readiness" value={values.budgetReadiness} />
      </dl>
    </div>
  );
}
