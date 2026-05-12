import {
  budgetReadinessOptions,
  monthlyRevenueBandOptions,
  netWorthBandOptions,
  timelineToActOptions,
  type StartHereFormValues,
} from "@/lib/start-here";

import { BinaryGroup, OptionGroup, TextArea } from "../fields";
import type { FieldErrors, UpdateValue } from "../types";

export function CommercialStep({
  values,
  updateValue,
  errors,
}: {
  values: StartHereFormValues;
  updateValue: UpdateValue;
  errors: FieldErrors;
}) {
  return (
    <div className="grid gap-6">
      <BinaryGroup
        label="Is your business your main source of income?"
        value={values.businessMainSourceOfIncome}
        error={errors.businessMainSourceOfIncome}
        onChange={(value) => {
          updateValue("businessMainSourceOfIncome", value);
          if (!value) {
            updateValue("monthlyRevenueBand", "");
          }
        }}
      />
      {values.businessMainSourceOfIncome ? (
        <OptionGroup
          label="What is your approximate monthly revenue?"
          options={monthlyRevenueBandOptions}
          value={values.monthlyRevenueBand}
          onChange={(value) => updateValue("monthlyRevenueBand", value)}
          error={errors.monthlyRevenueBand}
        />
      ) : null}
      <OptionGroup
        label="What is your current net worth? (USD, all assets)"
        options={netWorthBandOptions}
        value={values.netWorthBand}
        onChange={(value) => updateValue("netWorthBand", value)}
        error={errors.netWorthBand}
      />
      <OptionGroup
        label="How soon are you looking to act?"
        options={timelineToActOptions}
        value={values.timelineToAct}
        onChange={(value) => updateValue("timelineToAct", value)}
        error={errors.timelineToAct}
      />
      <OptionGroup
        label="Most Redomiciled engagements require a minimum initial investment of €1,500. If we confirm we’re the right fit, are you ready to invest at that level?"
        options={budgetReadinessOptions}
        value={values.budgetReadiness}
        onChange={(value) => updateValue("budgetReadiness", value)}
        error={errors.budgetReadiness}
      />
      <TextArea
        label="Anything important we should know before routing you? (optional)"
        value={values.importantRoutingNotes}
        onChange={(value) => updateValue("importantRoutingNotes", value)}
      />
    </div>
  );
}
