import { Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminPreset } from "@/lib/start-here-admin";

import { type StepId, steps } from "./step-metadata";

export function StartHereSidebar({
  stepIndex,
  completedSteps,
  availableSteps,
  adminAvailable,
  adminMode,
  presets,
  onStepSelect,
  onAdminModeChange,
  onPresetSelect,
}: {
  stepIndex: number;
  completedSteps: Set<StepId>;
  availableSteps: Set<StepId>;
  adminAvailable: boolean;
  adminMode: boolean;
  presets: AdminPreset[];
  onStepSelect: (index: number) => void;
  onAdminModeChange: (enabled: boolean) => void;
  onPresetSelect: (preset: AdminPreset) => void;
}) {
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);

  return (
    <aside className="relative flex shrink-0 flex-col justify-center gap-3 overflow-hidden lg:min-h-0 lg:gap-8">
      <div
        className={[
          "space-y-3 lg:space-y-5",
          adminAvailable ? "pr-20 sm:pr-0" : "",
        ].join(" ")}
      >
        <div className="space-y-5 sm:space-y-2 lg:space-y-4">
          <div className="flex items-center">
            <Image
              src="/redomiciled-logo.webp"
              alt="Redomiciled"
              width={166}
              height={29}
              className="h-7 w-auto shrink-0"
              priority
            />
            <span className="sr-only">Redomiciled</span>
          </div>
          <h1 className="font-heading text-ink max-w-2xl text-2xl leading-tight font-medium sm:text-4xl lg:text-6xl">
            Begin your global journey.
          </h1>
          <p className="text-stone hidden max-w-xl text-sm leading-6 sm:block sm:text-base lg:text-lg lg:leading-7">
            Please complete this short form to help us find the right next step
            for you.
          </p>
        </div>
      </div>

      <ol className="hidden grid-cols-4 gap-1.5 sm:grid lg:grid-cols-1 lg:gap-3">
        {steps.map((step, index) => {
          const active = index === stepIndex;
          const complete = completedSteps.has(step.id);
          const available = availableSteps.has(step.id);

          return (
            <li key={step.id} className="min-w-0">
              <button
                type="button"
                disabled={!available || active}
                onClick={() => onStepSelect(index)}
                className={[
                  "relative flex w-full min-w-0 flex-col gap-1 rounded-xl border px-2 py-2 text-left shadow-none ring-0 transition disabled:cursor-not-allowed lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:rounded-2xl lg:px-4 lg:py-3",
                  active
                    ? "border-brand bg-brand/5 shadow-sm"
                    : complete
                      ? "border-brand/30 bg-paper"
                      : available
                        ? "border-line bg-paper hover:border-brand/50 hover:bg-mist"
                        : "border-line bg-mist opacity-45",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "absolute inset-y-2 left-0 hidden w-1 rounded-r-full lg:block",
                    active ? "bg-brand" : complete ? "bg-brand/35" : "bg-line",
                  ].join(" ")}
                />
                <span className="min-w-0 lg:pl-2">
                  <span className="text-stone block text-[10px] lg:text-xs">
                    {step.eyebrow}
                  </span>
                  <span className="text-ink block truncate text-[11px] leading-snug font-semibold sm:text-xs lg:text-sm lg:whitespace-normal">
                    {step.label}
                  </span>
                </span>
                <span className="border-line bg-mist text-ink grid size-6 shrink-0 place-items-center self-end rounded-full border text-[10px] lg:size-7 lg:self-auto lg:text-xs">
                  {complete ? <Check className="size-4" /> : index + 1}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {adminAvailable ? (
        <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
          <Button
            type="button"
            variant="ghost"
            className="border-line bg-paper text-ink hover:border-brand hover:bg-mist hover:text-brand absolute top-0 right-0 h-8 rounded-lg border px-3 text-xs sm:hidden"
            onClick={() => {
              onAdminModeChange(true);
              setAdminDialogOpen(true);
            }}
          >
            Admin
          </Button>

          <div className="border-line bg-paper hidden rounded-2xl border p-3 sm:block">
            <div className="flex items-center justify-between gap-3">
              <p className="text-ink text-sm font-semibold">Admin preview</p>
              <Button
                type="button"
                variant="ghost"
                className="text-ink hover:bg-mist hover:text-brand h-8 rounded-lg px-3 text-xs"
                onClick={() => {
                  onAdminModeChange(true);
                  setAdminDialogOpen(true);
                }}
              >
                Choose view
              </Button>
            </div>
            {adminMode ? (
              <p className="text-stone mt-2 text-xs">
                Preview mode is on. All steps are unlocked.
              </p>
            ) : null}
          </div>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Admin preview</DialogTitle>
              <DialogDescription>
                Select a route view to populate sample data and jump to the
                final step.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 sm:grid-cols-2">
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  type="button"
                  variant="ghost"
                  className="border-line bg-paper text-stone hover:border-brand hover:bg-mist hover:text-ink h-auto justify-start rounded-xl border px-4 py-3 text-left text-sm"
                  onClick={() => {
                    onPresetSelect(preset);
                    setAdminDialogOpen(false);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </aside>
  );
}
