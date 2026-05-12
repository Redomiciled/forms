import type { StartHereFormValues } from "@/lib/start-here";

import { PhoneField, TextField } from "../fields";
import type { FieldErrors, UpdateValue } from "../types";

export function ContactStep({
  values,
  updateValue,
  errors,
}: {
  values: StartHereFormValues;
  updateValue: UpdateValue;
  errors: FieldErrors;
}) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="First name"
          value={values.firstName}
          onChange={(value) => updateValue("firstName", value)}
          autoComplete="given-name"
          error={errors.firstName}
        />
        <TextField
          label="Last name"
          value={values.lastName}
          onChange={(value) => updateValue("lastName", value)}
          autoComplete="family-name"
          error={errors.lastName}
        />
      </div>
      <div className="grid gap-4">
        <TextField
          label="Email"
          value={values.email}
          onChange={(value) => updateValue("email", value)}
          type="email"
          autoComplete="email"
          error={errors.email}
        />
      </div>
      <div className="grid gap-4">
        <PhoneField
          label="Phone"
          value={values.phone}
          onChange={(value) => updateValue("phone", value)}
          error={errors.phone}
        />
      </div>
      <TextField
        label="Who referred you? (optional)"
        value={values.referralDetail}
        onChange={(value) => updateValue("referralDetail", value)}
      />
    </div>
  );
}
