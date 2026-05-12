import { getCountries, type CountryCode } from "libphonenumber-js";

export type CountryOption = {
  flag: string;
  iso2: CountryCode;
  name: string;
};

const regionNames =
  typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export const countryOptions: CountryOption[] = getCountries()
  .map((iso2) => ({
    flag: countryCodeToFlag(iso2),
    iso2,
    name: regionNames?.of(iso2) ?? iso2,
  }))
  .sort((first, second) => first.name.localeCompare(second.name));

export function findCountryByName(name: string) {
  const normalizedName = normalizeCountrySearch(name);

  return countryOptions.find(
    (country) => normalizeCountrySearch(country.name) === normalizedName
  );
}

export function filterCountries(query: string) {
  const normalizedQuery = normalizeCountrySearch(query);

  if (!normalizedQuery) {
    return [];
  }

  return countryOptions.filter((country) =>
    normalizeCountrySearch(country.name).includes(normalizedQuery)
  );
}

export function countryNameExists(name: string) {
  return Boolean(findCountryByName(name));
}

function normalizeCountrySearch(value: string) {
  return value.trim().toLocaleLowerCase("en");
}

function countryCodeToFlag(countryCode: CountryCode) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (character) =>
      String.fromCodePoint(127397 + character.charCodeAt(0))
    );
}
