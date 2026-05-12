import { Check } from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const fieldControlClassName =
  "h-12 rounded-2xl border-white/16 bg-white/10 px-4 text-base text-white placeholder:text-white/35 focus-visible:border-[#8D8BFF] focus-visible:ring-4 focus-visible:ring-[#5C59FF]/20";

const optionCardClassName =
  "min-h-12 cursor-pointer rounded-2xl border px-4 py-3 text-left text-sm leading-5 transition peer-focus-visible:border-[#8D8BFF] peer-focus-visible:ring-4 peer-focus-visible:ring-[#5C59FF]/20";

const binaryCardClassName =
  "flex h-12 cursor-pointer items-center justify-center rounded-2xl border px-4 text-sm transition peer-focus-visible:border-[#8D8BFF] peer-focus-visible:ring-4 peer-focus-visible:ring-[#5C59FF]/20";

const activeOptionClassName =
  "border-[#A3A1FF] bg-white/20 text-white shadow-[0_0_22px_rgba(92,89,255,0.24)]";

const inactiveOptionClassName =
  "border-white/14 bg-white/8 text-white/72 hover:border-white/28 hover:bg-white/12";

const cardControlClassName =
  "absolute inset-0 z-10 h-full w-full cursor-pointer rounded-2xl opacity-0";

const phoneCountries = [
  { flag: "🇺🇸", name: "United States", dialCode: "+1" },
  { flag: "🇨🇦", name: "Canada", dialCode: "+1" },
  { flag: "🇬🇧", name: "United Kingdom", dialCode: "+44" },
  { flag: "🇪🇸", name: "Spain", dialCode: "+34" },
  { flag: "🇵🇹", name: "Portugal", dialCode: "+351" },
  { flag: "🇦🇪", name: "United Arab Emirates", dialCode: "+971" },
  { flag: "🇦🇷", name: "Argentina", dialCode: "+54" },
  { flag: "🇲🇽", name: "Mexico", dialCode: "+52" },
  { flag: "🇨🇴", name: "Colombia", dialCode: "+57" },
  { flag: "🇧🇷", name: "Brazil", dialCode: "+55" },
] as const;

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
    <Label className="grid gap-2 text-sm font-medium text-white/78">
      <span className={error ? "text-rose-100" : undefined}>{label}</span>
      <Input
        aria-invalid={Boolean(error)}
        className={cn(
          fieldControlClassName,
          error &&
            "border-rose-300/70 bg-rose-500/10 focus-visible:border-rose-200 focus-visible:ring-rose-400/25"
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
  const { country, localNumber } = splitPhoneValue(value);
  const [selectedCountry, setSelectedCountry] = useState(country);
  const activeCountry = value.trim() ? country : selectedCountry;

  function updatePhone(dialCode: string, number: string) {
    const trimmedNumber = number.trimStart();
    const nextValue = trimmedNumber.startsWith("+")
      ? trimmedNumber
      : `${dialCode} ${trimmedNumber}`;

    onChange(trimmedNumber ? nextValue : "");
  }

  return (
    <fieldset className="grid gap-2">
      <legend
        className={cn(
          "text-sm font-medium text-white/78",
          error && "text-rose-100"
        )}
      >
        {label}
      </legend>
      <div
        className={cn(
          "grid grid-cols-[8.75rem_minmax(0,1fr)] overflow-hidden rounded-2xl border border-white/16 bg-white/10 focus-within:border-[#8D8BFF] focus-within:ring-4 focus-within:ring-[#5C59FF]/20",
          error &&
            "border-rose-300/70 bg-rose-500/10 focus-within:border-rose-200 focus-within:ring-rose-400/25"
        )}
      >
        <select
          aria-label="Country code"
          className="h-12 min-w-0 border-r border-white/12 bg-transparent px-3 text-sm text-white outline-none"
          value={activeCountry.name}
          onChange={(event) => {
            const nextCountry =
              phoneCountries.find(
                (option) => option.name === event.target.value
              ) ?? activeCountry;

            setSelectedCountry(nextCountry);
            updatePhone(nextCountry.dialCode, localNumber);
          }}
        >
          {phoneCountries.map((option) => (
            <option
              key={`${option.name}-${option.dialCode}`}
              value={option.name}
              className="bg-[#12123A] text-white"
            >
              {option.flag} {option.dialCode}
            </option>
          ))}
        </select>
        <Input
          aria-label="Phone number"
          aria-invalid={Boolean(error)}
          className="h-12 rounded-none border-0 bg-transparent px-4 text-base text-white shadow-none outline-none placeholder:text-white/35 focus-visible:border-0 focus-visible:ring-0"
          value={localNumber}
          onChange={(event) =>
            updatePhone(activeCountry.dialCode, event.target.value)
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
    <Label className="grid gap-2 text-sm font-medium text-white/78">
      <span className={error ? "text-rose-100" : undefined}>{label}</span>
      <Textarea
        aria-invalid={Boolean(error)}
        className={cn(
          fieldControlClassName,
          "min-h-28 resize-y py-3",
          error &&
            "border-rose-300/70 bg-rose-500/10 focus-visible:border-rose-200 focus-visible:ring-rose-400/25"
        )}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError message={error} />
    </Label>
  );
}

function splitPhoneValue(value: string) {
  const normalized = value.trim();
  const country =
    phoneCountries.find((option) => normalized.startsWith(option.dialCode)) ??
    phoneCountries[0];
  const localNumber = normalized.startsWith(country.dialCode)
    ? normalized.slice(country.dialCode.length).trimStart()
    : normalized;

  return { country, localNumber };
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
          "mb-3 text-sm font-medium text-white/78",
          error && "text-rose-100"
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
                  error && !value && "border-rose-300/60 bg-rose-500/10"
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
          "mb-3 text-sm font-medium text-white/78",
          error && "text-rose-100"
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
                  error &&
                    values.length === 0 &&
                    "border-rose-300/60 bg-rose-500/10"
                )}
              >
                <span className="grid size-5 shrink-0 place-items-center rounded-md border border-white/25 bg-white/8">
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
          "mb-3 text-sm font-medium text-white/78",
          error && "text-rose-100"
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
                  error && value === null && "border-rose-300/60 bg-rose-500/10"
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
    <p className={cn("text-xs font-medium text-rose-100", className)}>
      {message}
    </p>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="text-card-foreground gap-0 rounded-2xl border border-white/12 bg-white/8 p-4 ring-0">
      <p className="text-xs text-white/45">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
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
    <Card className="text-card-foreground gap-0 rounded-2xl border border-white/12 bg-white/8 p-4 ring-0">
      <dt className="text-xs text-white/45">{label}</dt>
      <dd className="mt-1 text-white/85">{value || "Not provided"}</dd>
    </Card>
  );
}
