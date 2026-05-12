import {
  setupMaturityOptions,
  type StartHereFormValues,
} from "@/lib/start-here";

import { OptionGroup, TextArea, TextField } from "../fields";
import type { UpdateValue } from "../types";

export function ProfileStep({
  values,
  updateValue,
}: {
  values: StartHereFormValues;
  updateValue: UpdateValue;
}) {
  return (
    <div className="grid gap-6">
      <OptionGroup
        label="How would you describe where you're at today?"
        options={setupMaturityOptions}
        value={values.setupMaturity}
        onChange={(value) => updateValue("setupMaturity", value)}
      />
      <TextField
        label="Where are you currently a resident?"
        value={values.currentResidence}
        onChange={(value) => updateValue("currentResidence", value)}
      />
      <TextArea
        label="What passport(s) / citizenship(s) do you hold?"
        value={values.passportsCitizenships}
        onChange={(value) => updateValue("passportsCitizenships", value)}
      />
    </div>
  );
}
