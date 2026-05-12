import {
  consideringSpecificStructureOptions,
  tryingToSolveOptions,
  type StartHereFormValues,
} from "@/lib/start-here";

import { CheckboxGroup, OptionGroup } from "../fields";
import type { FieldErrors, UpdateValue } from "../types";

export function IntentStep({
  values,
  updateValue,
  toggleTryingToSolve,
  errors,
}: {
  values: StartHereFormValues;
  updateValue: UpdateValue;
  toggleTryingToSolve: (option: (typeof tryingToSolveOptions)[number]) => void;
  errors: FieldErrors;
}) {
  return (
    <div className="grid gap-6">
      <OptionGroup
        label="Are you considering a specific structure, bank account, or jurisdiction?"
        options={consideringSpecificStructureOptions}
        value={values.consideringSpecificStructure}
        onChange={(value) => updateValue("consideringSpecificStructure", value)}
        error={errors.consideringSpecificStructure}
      />
      <CheckboxGroup
        label="What are you trying to solve?"
        options={tryingToSolveOptions}
        values={values.tryingToSolve}
        onToggle={toggleTryingToSolve}
        error={errors.tryingToSolve}
      />
    </div>
  );
}
