import {
  budgetReadinessOptions,
  monthlyRevenueBandOptions,
  netWorthBandOptions,
  timelineToActOptions,
  type StartHereFormValues,
} from "@/lib/start-here";

import { BinaryGroup, OptionGroup, TextArea } from "../fields";
import type { UpdateValue } from "../types";

export function CommercialStep({
  values,
  updateValue,
}: {
  values: StartHereFormValues;
  updateValue: UpdateValue;
}) {
  return (
    <div className="grid gap-6">
      <BinaryGroup
        label="Is your business your main source of income?"
        value={values.businessMainSourceOfIncome}
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
        />
      ) : null}
      <OptionGroup
        label="What is your current net worth? (USD, all assets)"
        options={netWorthBandOptions}
        value={values.netWorthBand}
        onChange={(value) => updateValue("netWorthBand", value)}
      />
      <OptionGroup
        label="How soon are you looking to act?"
        options={timelineToActOptions}
        value={values.timelineToAct}
        onChange={(value) => updateValue("timelineToAct", value)}
      />
      <OptionGroup
        label="Most Redomiciled engagements require a minimum initial investment of EUR 1,500. If we confirm we're the right fit, are you ready to invest at that level?"
        options={budgetReadinessOptions}
        value={values.budgetReadiness}
        onChange={(value) => updateValue("budgetReadiness", value)}
      />
      <TextArea
        label="Anything important we should know before routing you? (optional)"
        value={values.importantRoutingNotes}
        onChange={(value) => updateValue("importantRoutingNotes", value)}
      />
    </div>
  );
}
