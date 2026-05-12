import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

export type PhoneCountry = {
  dialCode: string;
  flag: string;
  iso2: CountryCode;
  name: string;
};

const preferredCountryByDialCode: Partial<Record<string, CountryCode>> = {
  "+1": "US",
  "+44": "GB",
  "+54": "AR",
};

const regionNames =
  typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export const phoneCountries: PhoneCountry[] = getCountries()
  .map((iso2) => ({
    dialCode: `+${getCountryCallingCode(iso2)}`,
    flag: countryCodeToFlag(iso2),
    iso2,
    name: regionNames?.of(iso2) ?? iso2,
  }))
  .sort((first, second) => first.name.localeCompare(second.name));

const dialCodes = Array.from(
  new Set(phoneCountries.map((country) => country.dialCode))
).sort((first, second) => second.length - first.length);

export function normalizeDialCode(value: string) {
  const digits = value.replace(/\D/g, "");

  return digits ? `+${digits}` : "";
}

export function findCountryByDialCode(dialCode: string) {
  const normalizedDialCode = normalizeDialCode(dialCode);

  if (!normalizedDialCode) {
    return undefined;
  }

  const countries = phoneCountries.filter(
    (country) => country.dialCode === normalizedDialCode
  );
  const preferredCountry = preferredCountryByDialCode[normalizedDialCode];

  return (
    countries.find((country) => country.iso2 === preferredCountry) ??
    countries[0]
  );
}

export function splitPhoneValue(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return { dialCode: "", localNumber: "" };
  }

  if (!normalized.startsWith("+")) {
    return { dialCode: "", localNumber: normalized };
  }

  const [firstToken = "", ...rest] = normalized.split(/\s+/);
  const firstTokenDialCode = normalizeDialCode(firstToken);

  if (rest.length > 0) {
    return {
      dialCode: firstTokenDialCode || "+1",
      localNumber: rest.join(" "),
    };
  }

  const matchingDialCode = dialCodes.find((dialCode) =>
    normalized.startsWith(dialCode)
  );

  if (!matchingDialCode) {
    return { dialCode: firstTokenDialCode, localNumber: "" };
  }

  return {
    dialCode: matchingDialCode,
    localNumber: normalized.slice(matchingDialCode.length).trimStart(),
  };
}

export function joinPhoneValue(dialCode: string, localNumber: string) {
  const normalizedDialCode = normalizeDialCode(dialCode);
  const normalizedLocalNumber = localNumber.trimStart();

  return [normalizedDialCode, normalizedLocalNumber].filter(Boolean).join(" ");
}

function countryCodeToFlag(countryCode: CountryCode) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (character) =>
      String.fromCodePoint(127397 + character.charCodeAt(0))
    );
}
