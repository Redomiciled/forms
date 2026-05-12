import { leadSourceDetails, type StartHereFormValues } from "@/lib/start-here";

import { OptionGroup, TextField } from "../fields";
import type { UpdateValue } from "../types";

export function ContactStep({
  values,
  updateValue,
}: {
  values: StartHereFormValues;
  updateValue: UpdateValue;
}) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="First name"
          value={values.firstName}
          onChange={(value) => updateValue("firstName", value)}
          autoComplete="given-name"
        />
        <TextField
          label="Last name"
          value={values.lastName}
          onChange={(value) => updateValue("lastName", value)}
          autoComplete="family-name"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Email"
          value={values.email}
          onChange={(value) => updateValue("email", value)}
          type="email"
          autoComplete="email"
        />
        <TextField
          label="WhatsApp / phone"
          value={values.phone}
          onChange={(value) => updateValue("phone", value)}
          type="tel"
          autoComplete="tel"
        />
      </div>
      <OptionGroup
        label="Where are you coming from?"
        options={leadSourceDetails}
        value={values.leadSourceDetail}
        onChange={(value) => updateValue("leadSourceDetail", value)}
      />
      <TextField
        label="Who referred you? (optional)"
        value={values.referralDetail}
        onChange={(value) => updateValue("referralDetail", value)}
      />
    </div>
  );
}
