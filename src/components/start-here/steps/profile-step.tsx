import {
  setupMaturityOptions,
  type StartHereFormValues,
} from "@/lib/start-here";

import {
  CountryMultiSelectField,
  CountrySelectField,
  OptionGroup,
} from "../fields";
import type { FieldErrors, UpdateValue } from "../types";

export function ProfileStep({
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
      <OptionGroup
        label="How would you describe where you're at today?"
        options={setupMaturityOptions}
        value={values.setupMaturity}
        onChange={(value) => updateValue("setupMaturity", value)}
        error={errors.setupMaturity}
      />
      <CountrySelectField
        label="Where are you currently a resident?"
        value={values.currentResidence}
        onChange={(value) => updateValue("currentResidence", value)}
        error={errors.currentResidence}
      />
      <CountryMultiSelectField
        label="What passport(s) / citizenship(s) do you hold?"
        value={values.passportsCitizenships}
        onChange={(value) => updateValue("passportsCitizenships", value)}
        error={errors.passportsCitizenships}
      />
    </div>
  );
}
