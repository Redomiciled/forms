import { describe, expect, it } from "vitest";

import {
  findCountryByDialCode,
  joinPhoneValue,
  splitPhoneValue,
} from "./phone";

describe("phone helpers", () => {
  it("uses a sensible default country for shared calling codes", () => {
    expect(findCountryByDialCode("+1")?.iso2).toBe("US");
  });

  it("splits stored phone values into calling code and local number", () => {
    expect(splitPhoneValue("+54 11 1234 5678")).toEqual({
      dialCode: "+54",
      localNumber: "11 1234 5678",
    });
  });

  it("joins editable phone parts into the submitted value", () => {
    expect(joinPhoneValue("+54", "11 1234 5678")).toBe("+54 11 1234 5678");
  });
});
