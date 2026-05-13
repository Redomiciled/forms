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
          <h1 className="hidden max-w-2xl leading-tight font-semibold sm:block sm:text-4xl lg:text-6xl">
            Begin your global journey.
          </h1>
          <p className="hidden max-w-xl text-sm leading-6 text-white/72 sm:block sm:text-base lg:text-lg lg:leading-7">
            Please complete this short form to help us find the right next step
            for you.
          </p>
        </div>
      </div>

      <ol className="grid grid-cols-4 gap-1.5 lg:grid-cols-1 lg:gap-3">
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
                  "relative flex w-full min-w-0 flex-col gap-1 rounded-xl border px-2 py-2 text-left shadow-none ring-0 backdrop-blur transition disabled:cursor-not-allowed lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:rounded-2xl lg:px-4 lg:py-3",
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
                <span className="min-w-0 lg:pl-2">
                  <span className="block text-[10px] text-white/50 lg:text-xs">
                    {step.eyebrow}
                  </span>
                  <span className="block truncate text-[11px] leading-snug font-semibold text-white sm:text-xs lg:text-sm lg:whitespace-normal">
                    {step.label}
                  </span>
                </span>
                <span className="grid size-6 shrink-0 place-items-center self-end rounded-full border border-white/20 bg-white/10 text-[10px] lg:size-7 lg:self-auto lg:text-xs">
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
            className="absolute top-0 right-0 h-8 rounded-lg border border-white/12 bg-white/8 px-3 text-xs text-white hover:bg-white/12 hover:text-white sm:hidden"
            onClick={() => {
              onAdminModeChange(true);
              setAdminDialogOpen(true);
            }}
          >
            Admin
          </Button>

          <div className="hidden rounded-2xl border border-white/12 bg-white/7 p-3 backdrop-blur sm:block">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Admin preview</p>
              <Button
                type="button"
                variant="ghost"
                className="h-8 rounded-lg px-3 text-xs text-white hover:bg-white/10 hover:text-white"
                onClick={() => {
                  onAdminModeChange(true);
                  setAdminDialogOpen(true);
                }}
              >
                Choose view
              </Button>
            </div>
            {adminMode ? (
              <p className="mt-2 text-xs text-white/50">
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
                  className="h-auto justify-start rounded-xl border border-white/10 bg-white/7 px-4 py-3 text-left text-sm text-white/75 hover:bg-white/12 hover:text-white"
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
