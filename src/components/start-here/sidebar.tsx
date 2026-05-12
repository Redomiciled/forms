import { Check } from "lucide-react";
import Image from "next/image";

import { type StepId, steps } from "./step-metadata";

export function StartHereSidebar({
  stepIndex,
  completedSteps,
  availableSteps,
  onStepSelect,
}: {
  stepIndex: number;
  completedSteps: Set<StepId>;
  availableSteps: Set<StepId>;
  onStepSelect: (index: number) => void;
}) {
  return (
    <aside className="flex shrink-0 flex-col justify-center gap-3 overflow-hidden lg:min-h-0 lg:gap-8">
      <div className="space-y-3 lg:space-y-5">
        <div className="space-y-2 lg:space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src="/redomiciled-logo.png"
              alt=""
              width={40}
              height={34}
              className="h-8 w-auto shrink-0 sm:h-9"
              priority
            />
            <p className="text-base font-semibold text-white sm:text-lg">
              Redomiciled
            </p>
          </div>
          <h1 className="max-w-2xl text-3xl leading-tight font-semibold sm:text-4xl lg:text-6xl">
            Begin your global journey.
          </h1>
          <p className="hidden max-w-xl text-sm leading-6 text-white/72 sm:block sm:text-base lg:text-lg lg:leading-7">
            Please complete this short form to help us find the right next step
            for you.
          </p>
        </div>
      </div>

      <ol className="grid grid-cols-5 gap-1.5 lg:grid-cols-1 lg:gap-3">
        {steps.map((step, index) => {
          const active = index === stepIndex;
          const complete = completedSteps.has(step.id);
          const available = availableSteps.has(step.id);

          return (
            <li
              key={step.id}
              className={[
                "relative flex min-w-0 flex-col gap-1 rounded-xl border px-2 py-2 shadow-none ring-0 backdrop-blur transition lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:rounded-2xl lg:px-4 lg:py-3",
                active
                  ? "border-white/38 bg-white/18 shadow-[0_0_34px_rgba(92,89,255,0.28)]"
                  : complete
                    ? "border-white/20 bg-white/10"
                    : available
                      ? "border-white/12 bg-white/7"
                      : "border-white/8 bg-white/4 opacity-45",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "absolute inset-y-2 left-0 hidden w-1 rounded-r-full lg:block",
                  active
                    ? "bg-[#A3A1FF]"
                    : complete
                      ? "bg-white/35"
                      : "bg-white/12",
                ].join(" ")}
              />
              <button
                type="button"
                className="min-w-0 text-left disabled:cursor-not-allowed lg:pl-2"
                disabled={!available || active}
                onClick={() => onStepSelect(index)}
              >
                <span className="block text-[10px] text-white/50 lg:text-xs">
                  {step.eyebrow}
                </span>
                <span className="block truncate text-[11px] leading-snug font-semibold text-white sm:text-xs lg:text-sm lg:whitespace-normal">
                  {step.label}
                </span>
              </button>
              <span className="grid size-6 shrink-0 place-items-center self-end rounded-full border border-white/20 bg-white/10 text-[10px] lg:size-7 lg:self-auto lg:text-xs">
                {complete ? <Check className="size-4" /> : index + 1}
              </span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
