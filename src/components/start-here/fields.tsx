import { Check } from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  findCountryByDialCode,
  joinPhoneValue,
  splitPhoneValue,
} from "@/lib/phone";
import {
  countryNameExists,
  filterCountries,
  findCountryByName,
} from "@/lib/countries";
import { cn } from "@/lib/utils";

const fieldControlClassName =
  "h-12 rounded-2xl border-line bg-paper px-4 text-base text-ink placeholder:text-stone/55 focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/15";

const optionCardClassName =
  "min-h-12 cursor-pointer rounded-2xl border px-4 py-3 text-left text-sm leading-5 transition peer-focus-visible:border-brand peer-focus-visible:ring-4 peer-focus-visible:ring-brand/15";

const binaryCardClassName =
  "flex h-12 cursor-pointer items-center justify-center rounded-2xl border px-4 text-sm transition peer-focus-visible:border-brand peer-focus-visible:ring-4 peer-focus-visible:ring-brand/15";

const activeOptionClassName = "border-brand bg-brand/5 text-ink shadow-sm";

const inactiveOptionClassName =
  "border-line bg-paper text-stone hover:border-brand/50 hover:bg-mist hover:text-ink";

const cardControlClassName =
  "absolute inset-0 z-10 h-full w-full cursor-pointer rounded-2xl opacity-0";

function optionId(label: string, option: string) {
  return `${label}-${option}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "email" | "tel" | "text";
  autoComplete?: string;
  error?: string | undefined;
}) {
  return (
    <Label className="text-ink grid gap-2 text-sm font-medium">
      <span className={error ? "text-red-600" : undefined}>{label}</span>
      <Input
        aria-invalid={Boolean(error)}
        className={cn(
          fieldControlClassName,
          error &&
            "border-red-600/70 bg-red-50 focus-visible:border-red-600 focus-visible:ring-red-600/15"
        )}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        autoComplete={autoComplete}
      />
      <FieldError message={error} />
    </Label>
  );
}

export function PhoneField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
}) {
  const { dialCode, localNumber } = splitPhoneValue(value);
  const activeCountry = findCountryByDialCode(dialCode);

  return (
    <fieldset className="grid gap-2">
      <legend
        className={cn("text-ink text-sm font-medium", error && "text-red-600")}
      >
        {label}
      </legend>
      <div
        className={cn(
          "border-line bg-paper focus-within:border-brand focus-within:ring-brand/15 flex h-12 overflow-hidden rounded-2xl border focus-within:ring-4",
          error &&
            "border-red-600/70 bg-red-50 focus-within:border-red-600 focus-within:ring-red-600/15"
        )}
      >
        <div className="border-line bg-mist flex h-12 w-24 shrink-0 items-center border-r pl-3 sm:w-36 sm:pl-4">
          <span
            aria-label={activeCountry?.name ?? "Unknown country"}
            className="w-7 text-base"
          >
            {activeCountry?.flag ?? ""}
          </span>
          <Input
            aria-label="Country calling code"
            className="text-ink placeholder:text-stone/55 h-12 w-full rounded-none border-0 bg-transparent px-1 text-base font-medium shadow-none outline-none focus-visible:border-0 focus-visible:ring-0"
            value={dialCode}
            onChange={(event) =>
              onChange(joinPhoneValue(event.target.value, localNumber))
            }
            type="tel"
            autoComplete="tel-country-code"
            inputMode="tel"
            placeholder="+"
          />
        </div>
        <Input
          aria-label="Phone number"
          aria-invalid={Boolean(error)}
          className="text-ink placeholder:text-stone/55 h-12 min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 text-base shadow-none outline-none focus-visible:border-0 focus-visible:ring-0 sm:px-4"
          value={localNumber}
          onChange={(event) =>
            onChange(joinPhoneValue(dialCode, event.target.value))
          }
          type="tel"
          autoComplete="tel-national"
          inputMode="tel"
        />
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
}) {
  return (
    <Label className="text-ink grid gap-2 text-sm font-medium">
      <span className={error ? "text-red-600" : undefined}>{label}</span>
      <Textarea
        aria-invalid={Boolean(error)}
        className={cn(
          fieldControlClassName,
          "min-h-28 resize-y py-3",
          error &&
            "border-red-600/70 bg-red-50 focus-visible:border-red-600 focus-visible:ring-red-600/15"
        )}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError message={error} />
    </Label>
  );
}

export function CountrySelectField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
}) {
  const [query, setQuery] = useState("");
  const selectedCountry = findCountryByName(value);
  const filteredCountries = filterCountries(query)
    .filter((country) => country.name !== selectedCountry?.name)
    .slice(0, 12);

  function handleQueryChange(nextQuery: string) {
    const matchingCountry = findCountryByName(nextQuery);

    setQuery(nextQuery);

    if (matchingCountry && matchingCountry.name !== selectedCountry?.name) {
      onChange(matchingCountry.name);
      setQuery("");
    }
  }

  function selectCountry(country: string) {
    setQuery("");
    onChange(country);
  }

  return (
    <fieldset className="grid gap-4">
      <legend
        className={cn("text-ink text-sm font-medium", error && "text-red-600")}
      >
        {label}
      </legend>
      <div
        className={cn(
          "border-line bg-mist grid gap-3 rounded-2xl border p-4",
          error && "border-red-600/70 bg-red-50"
        )}
      >
        {filteredCountries.length > 0 ? (
          <div
            aria-label={`${label} matches`}
            className="grid max-h-56 gap-2 overflow-auto pr-1 sm:grid-cols-2"
          >
            {filteredCountries.map((option) => {
              const active = option.name === selectedCountry?.name;

              return (
                <button
                  key={option.name}
                  type="button"
                  aria-pressed={active}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition",
                    active ? activeOptionClassName : inactiveOptionClassName
                  )}
                  onClick={() => selectCountry(option.name)}
                >
                  <span>{option.flag}</span>
                  <span>{option.name}</span>
                </button>
              );
            })}
          </div>
        ) : query.trim() ? (
          <p className="border-line bg-paper text-stone rounded-xl border px-3 py-2 text-sm">
            No countries match that search.
          </p>
        ) : null}
        <Input
          aria-label={`${label} search`}
          className={fieldControlClassName}
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") {
              return;
            }

            event.preventDefault();

            const matchingCountry = findCountryByName(query);

            if (matchingCountry) {
              selectCountry(matchingCountry.name);
            }
          }}
          placeholder="Search country"
        />
        {selectedCountry ? (
          <div className="border-line bg-paper text-ink inline-flex w-fit items-center gap-2 rounded-xl border px-3 py-2 text-sm">
            <span>{selectedCountry.flag}</span>
            <span>{selectedCountry.name}</span>
          </div>
        ) : null}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}

export function CountryMultiSelectField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
}) {
  const [query, setQuery] = useState("");
  const selectedCountries = parseCountryList(value);
  const filteredCountries = filterCountries(query)
    .filter((country) => !selectedCountries.includes(country.name))
    .slice(0, 12);

  function toggleCountry(country: string) {
    const nextCountries = selectedCountries.includes(country)
      ? selectedCountries.filter((item) => item !== country)
      : [...selectedCountries, country];

    onChange(nextCountries.join(", "));
    setQuery("");
  }

  return (
    <fieldset className="grid gap-4">
      <legend
        className={cn("text-ink text-sm font-medium", error && "text-red-600")}
      >
        {label}
      </legend>
      <div
        className={cn(
          "border-line bg-mist grid gap-3 rounded-2xl border p-4",
          error && "border-red-600/70 bg-red-50"
        )}
      >
        {filteredCountries.length > 0 ? (
          <div
            aria-label={`${label} matches`}
            className="grid max-h-56 gap-2 overflow-auto pr-1 sm:grid-cols-2"
          >
            {filteredCountries.map((option) => (
              <button
                key={option.name}
                type="button"
                aria-pressed={false}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition",
                  inactiveOptionClassName
                )}
                onClick={() => toggleCountry(option.name)}
              >
                <span>{option.flag}</span>
                <span>{option.name}</span>
              </button>
            ))}
          </div>
        ) : query.trim() ? (
          <p className="border-line bg-paper text-stone rounded-xl border px-3 py-2 text-sm">
            No countries match that search.
          </p>
        ) : null}
        <Input
          aria-label={`${label} search`}
          className={fieldControlClassName}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") {
              return;
            }

            event.preventDefault();

            const matchingCountry = findCountryByName(query);

            if (
              matchingCountry &&
              !selectedCountries.includes(matchingCountry.name)
            ) {
              toggleCountry(matchingCountry.name);
            }
          }}
          placeholder="Search country"
        />
        {selectedCountries.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedCountries.map((country) => (
              <button
                key={country}
                type="button"
                aria-label={`Remove ${country}`}
                className="border-line bg-paper text-ink hover:border-brand/50 hover:bg-cloud inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                onClick={() => toggleCountry(country)}
              >
                <span>{getCountryFlag(country)}</span>
                <span>{country}</span>
                <span className="text-stone">×</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}

function parseCountryList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(countryNameExists);
}

function getCountryFlag(country: string) {
  return findCountryByName(country)?.flag ?? country.slice(0, 2).toUpperCase();
}

export function OptionGroup<Option extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: readonly Option[];
  value: Option | "";
  onChange: (value: Option) => void;
  error?: string | undefined;
}) {
  return (
    <fieldset>
      <legend
        className={cn(
          "text-ink mb-3 text-sm font-medium",
          error && "text-red-600"
        )}
      >
        {label}
      </legend>
      <RadioGroup
        aria-invalid={Boolean(error)}
        className="grid gap-3 sm:grid-cols-2"
        value={value}
        onValueChange={(nextValue) => onChange(nextValue as Option)}
      >
        {options.map((option) => {
          const active = value === option;
          const id = optionId(label, option);

          return (
            <div key={option} className="relative">
              <RadioGroupItem
                id={id}
                value={option}
                className={cn(
                  "peer",
                  cardControlClassName,
                  "data-checked:bg-transparent dark:data-checked:bg-transparent"
                )}
              />
              <Label
                htmlFor={id}
                className={cn(
                  optionCardClassName,
                  active ? activeOptionClassName : inactiveOptionClassName,
                  error && !value && "border-red-600/60 bg-red-50"
                )}
              >
                {option}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
      <FieldError message={error} className="mt-2" />
    </fieldset>
  );
}

export function CheckboxGroup<Option extends string>({
  label,
  options,
  values,
  onToggle,
  error,
}: {
  label: string;
  options: readonly Option[];
  values: Option[];
  onToggle: (value: Option) => void;
  error?: string | undefined;
}) {
  return (
    <fieldset>
      <legend
        className={cn(
          "text-ink mb-3 text-sm font-medium",
          error && "text-red-600"
        )}
      >
        {label}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const active = values.includes(option);
          const id = optionId(label, option);

          return (
            <div key={option} className="relative">
              <Checkbox
                id={id}
                checked={active}
                onCheckedChange={() => onToggle(option)}
                className={cn(
                  "peer",
                  cardControlClassName,
                  "data-checked:bg-transparent dark:data-checked:bg-transparent"
                )}
              />
              <Label
                htmlFor={id}
                className={cn(
                  "flex items-center gap-3",
                  optionCardClassName,
                  active ? activeOptionClassName : inactiveOptionClassName,
                  error && values.length === 0 && "border-red-600/60 bg-red-50"
                )}
              >
                <span className="border-line bg-paper text-brand grid size-5 shrink-0 place-items-center rounded-md border">
                  {active ? <Check className="size-3.5" /> : null}
                </span>
                {option}
              </Label>
            </div>
          );
        })}
      </div>
      <FieldError message={error} className="mt-2" />
    </fieldset>
  );
}

export function BinaryGroup({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  error?: string | undefined;
}) {
  return (
    <fieldset>
      <legend
        className={cn(
          "text-ink mb-3 text-sm font-medium",
          error && "text-red-600"
        )}
      >
        {label}
      </legend>
      <RadioGroup
        aria-invalid={Boolean(error)}
        className="grid grid-cols-2 gap-3"
        value={value === null ? "" : String(value)}
        onValueChange={(nextValue) => onChange(nextValue === "true")}
      >
        {[
          { label: "Yes", value: true },
          { label: "No", value: false },
        ].map((option) => {
          const active = value === option.value;
          const id = optionId(label, option.label);

          return (
            <div key={option.label} className="relative">
              <RadioGroupItem
                id={id}
                value={String(option.value)}
                className={cn(
                  "peer",
                  cardControlClassName,
                  "data-checked:bg-transparent dark:data-checked:bg-transparent"
                )}
              />
              <Label
                htmlFor={id}
                className={cn(
                  binaryCardClassName,
                  active ? activeOptionClassName : inactiveOptionClassName,
                  error && value === null && "border-red-600/60 bg-red-50"
                )}
              >
                {option.label}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
      <FieldError message={error} className="mt-2" />
    </fieldset>
  );
}

function FieldError({
  message,
  className,
}: {
  message?: string | undefined;
  className?: string | undefined;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className={cn("text-xs font-medium text-red-600", className)}>
      {message}
    </p>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="text-card-foreground border-line bg-paper gap-0 rounded-2xl border p-4 ring-0">
      <p className="text-stone text-xs">{label}</p>
      <p className="text-ink mt-1 font-semibold">{value}</p>
    </Card>
  );
}

export function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card className="text-card-foreground border-line bg-paper gap-0 rounded-2xl border p-4 ring-0">
      <dt className="text-stone text-xs">{label}</dt>
      <dd className="text-ink mt-1">{value || "Not provided"}</dd>
    </Card>
  );
}
