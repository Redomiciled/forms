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
  const monthlyRevenue = values.businessMainSourceOfIncome
    ? values.monthlyRevenueBand || "Not selected"
    : "Not applicable";

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border border-white/12 bg-white/8 p-5">
        <h3 className="text-lg font-semibold">Review your answers</h3>
        <p className="mt-2 text-sm leading-6 text-white/65">
          Confirm the details below before we show the right next step.
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
        <SummaryItem label="Phone" value={values.phone} />
        <SummaryItem
          label="Who referred you?"
          value={values.referralDetail || "Not provided"}
        />
        <SummaryItem
          label="Structure, bank account, or jurisdiction"
          value={values.consideringSpecificStructure || "Not selected"}
        />
        <SummaryItem label="Current setup" value={values.setupMaturity} />
        <SummaryItem
          label="Currently a resident"
          value={values.currentResidence}
        />
        <SummaryItem
          label="Passport(s) / citizenship(s)"
          value={values.passportsCitizenships}
        />
        <SummaryItem
          label="Business is main source of income"
          value={
            values.businessMainSourceOfIncome === null
              ? "Not selected"
              : values.businessMainSourceOfIncome
                ? "Yes"
                : "No"
          }
        />
        <SummaryItem label="Monthly revenue" value={monthlyRevenue} />
        <SummaryItem
          label="Net worth"
          value={values.netWorthBand || "Not selected"}
        />
        <SummaryItem
          label="Timeline"
          value={values.timelineToAct || "Not selected"}
        />
        <SummaryItem
          label="Budget readiness"
          value={values.budgetReadiness || "Not selected"}
        />
        <SummaryItem
          label="Anything important"
          value={values.importantRoutingNotes || "Not provided"}
        />
      </dl>
      <div className="rounded-2xl border border-white/12 bg-white/8 p-4 text-sm text-white/75">
        <p className="font-semibold text-white">
          What are you trying to solve?
        </p>
        <p className="mt-2 leading-6">
          {values.tryingToSolve.join(", ") || "Not selected"}
        </p>
      </div>
    </div>
  );
}
