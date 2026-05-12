import { Check } from "lucide-react";

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "email" | "tel" | "text";
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-white/78">
      {label}
      <input
        className="h-12 rounded-2xl border border-white/16 bg-white/10 px-4 text-base text-white transition outline-none placeholder:text-white/35 focus:border-[#8D8BFF] focus:ring-4 focus:ring-[#5C59FF]/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        autoComplete={autoComplete}
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-white/78">
      {label}
      <textarea
        className="min-h-28 resize-y rounded-2xl border border-white/16 bg-white/10 px-4 py-3 text-base text-white transition outline-none placeholder:text-white/35 focus:border-[#8D8BFF] focus:ring-4 focus:ring-[#5C59FF]/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function OptionGroup<Option extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly Option[];
  value: Option | "";
  onChange: (value: Option) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-white/78">
        {label}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const active = value === option;

          return (
            <button
              key={option}
              className={[
                "min-h-12 rounded-2xl border px-4 py-3 text-left text-sm transition",
                active
                  ? "border-[#A3A1FF] bg-white/20 text-white shadow-[0_0_22px_rgba(92,89,255,0.24)]"
                  : "border-white/14 bg-white/8 text-white/72 hover:border-white/28 hover:bg-white/12",
              ].join(" ")}
              type="button"
              onClick={() => onChange(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function CheckboxGroup<Option extends string>({
  label,
  options,
  values,
  onToggle,
}: {
  label: string;
  options: readonly Option[];
  values: Option[];
  onToggle: (value: Option) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-white/78">
        {label}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const active = values.includes(option);

          return (
            <button
              key={option}
              className={[
                "flex min-h-12 items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition",
                active
                  ? "border-[#A3A1FF] bg-white/20 text-white shadow-[0_0_22px_rgba(92,89,255,0.24)]"
                  : "border-white/14 bg-white/8 text-white/72 hover:border-white/28 hover:bg-white/12",
              ].join(" ")}
              type="button"
              onClick={() => onToggle(option)}
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-md border border-white/25 bg-white/8">
                {active ? <Check className="size-3.5" /> : null}
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function BinaryGroup({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-white/78">
        {label}
      </legend>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Yes", value: true },
          { label: "No", value: false },
        ].map((option) => {
          const active = value === option.value;

          return (
            <button
              key={option.label}
              className={[
                "h-12 rounded-2xl border px-4 text-sm transition",
                active
                  ? "border-[#A3A1FF] bg-white/20 text-white shadow-[0_0_22px_rgba(92,89,255,0.24)]"
                  : "border-white/14 bg-white/8 text-white/72 hover:border-white/28 hover:bg-white/12",
              ].join(" ")}
              type="button"
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
      <p className="text-xs text-white/45">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
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
    <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
      <dt className="text-xs text-white/45">{label}</dt>
      <dd className="mt-1 text-white/85">{value || "Not provided"}</dd>
    </div>
  );
}
