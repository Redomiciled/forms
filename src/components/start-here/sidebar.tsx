import { Check } from "lucide-react";
import Image from "next/image";

import { steps } from "./step-metadata";

export function StartHereSidebar({ stepIndex }: { stepIndex: number }) {
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
          const complete = index < stepIndex;

          return (
            <li
              key={step.id}
              className={[
                "flex min-w-0 flex-col gap-1 rounded-xl border px-2 py-2 backdrop-blur lg:flex-row lg:items-center lg:justify-between lg:rounded-2xl lg:px-4 lg:py-3",
                active
                  ? "border-white/35 bg-white/16 shadow-[0_0_30px_rgba(92,89,255,0.22)]"
                  : "border-white/12 bg-white/7",
              ].join(" ")}
            >
              <div className="min-w-0">
                <p className="text-[10px] text-white/50 lg:text-xs">
                  {step.eyebrow}
                </p>
                <p className="truncate text-xs font-semibold lg:text-sm">
                  {step.label}
                </p>
              </div>
              <span className="grid size-6 place-items-center rounded-full border border-white/20 bg-white/10 text-[10px] lg:size-7 lg:text-xs">
                {complete ? <Check className="size-4" /> : index + 1}
              </span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
