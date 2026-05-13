"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  emptyStartHereFormValues,
  prepareStartHereSubmission,
  tryingToSolveOptions,
  validateStartHereValues,
  type StartHereFormValues,
  type StartHerePreparedSubmission,
} from "@/lib/start-here";
import { adminPresets, type AdminPreset } from "@/lib/start-here-admin";

import {
  getFirstErrorStep,
  getStepErrors,
  getStepTitle,
  isStepValid,
  steps,
  type StepId,
} from "./start-here/step-metadata";
import { StartHereSidebar } from "./start-here/sidebar";
import { CommercialStep } from "./start-here/steps/commercial-step";
import { ContactStep } from "./start-here/steps/contact-step";
import { IntentStep } from "./start-here/steps/intent-step";
import { ProfileStep } from "./start-here/steps/profile-step";
import { ReviewStep } from "./start-here/steps/review-step";
import { SubmittedState } from "./start-here/submitted-state";

export function StartHereForm() {
  const shellRef = useRef<HTMLElement>(null);
  const [values, setValues] = useState<StartHereFormValues>(
    emptyStartHereFormValues
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [attemptedSteps, setAttemptedSteps] = useState<Set<StepId>>(
    () => new Set()
  );
  const adminAvailable = useAdminAvailable();
  const [adminMode, setAdminMode] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitted, setSubmitted] =
    useState<StartHerePreparedSubmission | null>(null);
  const validation = useMemo(() => validateStartHereValues(values), [values]);
  const completedSteps = useMemo(() => {
    return new Set(
      steps
        .filter((_step, index) => index < maxStepReached)
        .filter((step) => isStepValid(step.id, validation.errors))
        .map((step) => step.id)
    );
  }, [maxStepReached, validation.errors]);
  const availableSteps = useMemo(() => {
    const available = new Set<StepId>();

    steps.forEach((step, index) => {
      const priorStepsValid = steps
        .slice(0, index)
        .every((priorStep) => isStepValid(priorStep.id, validation.errors));

      if (adminMode || (index <= maxStepReached && priorStepsValid)) {
        available.add(step.id);
      }
    });

    return available;
  }, [adminMode, maxStepReached, validation.errors]);
  const currentStep = steps[stepIndex] ?? {
    id: "contact",
    label: "Contact Info",
    eyebrow: "Step 1",
  };
  const currentStepErrors = attemptedSteps.has(currentStep.id)
    ? getStepErrors(currentStep.id, validation.errors)
    : {};
  const currentStepHasErrors = Object.keys(currentStepErrors).length > 0;

  function updateValue<Key extends keyof StartHereFormValues>(
    key: Key,
    value: StartHereFormValues[Key]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function toggleTryingToSolve(option: (typeof tryingToSolveOptions)[number]) {
    setValues((current) => {
      const exists = current.tryingToSolve.includes(option);

      return {
        ...current,
        tryingToSolve: exists
          ? current.tryingToSolve.filter((item) => item !== option)
          : [...current.tryingToSolve, option],
      };
    });
  }

  function goNext() {
    const nextValidation = validateStartHereValues(values);

    if (!adminMode && !isStepValid(currentStep.id, nextValidation.errors)) {
      markStepAttempted(currentStep.id);
      return;
    }

    if (stepIndex === steps.length - 1) {
      setReviewOpen(true);
      return;
    }

    const nextIndex = Math.min(stepIndex + 1, steps.length - 1);
    setStepIndex(nextIndex);
    setMaxStepReached((current) => Math.max(current, nextIndex));
    scrollMobileToTop();
  }

  function goBack() {
    setStepIndex((current) => {
      const nextIndex = Math.max(current - 1, 0);

      if (nextIndex !== current) {
        scrollMobileToTop();
      }

      return nextIndex;
    });
  }

  function goToStep(index: number) {
    const step = steps[index];

    if (!step || !availableSteps.has(step.id)) {
      return;
    }

    setStepIndex(index);
    scrollMobileToTop();
  }

  function submitForm() {
    const nextValidation = validateStartHereValues(values);

    if (!adminMode && !nextValidation.ok) {
      const firstErrorStep = getFirstErrorStep(nextValidation.errors);
      const firstErrorStepIndex = steps.findIndex(
        (step) => step.id === firstErrorStep
      );
      setReviewOpen(false);
      markStepAttempted(firstErrorStep);
      setStepIndex(firstErrorStepIndex);
      return;
    }

    setSubmitted(prepareStartHereSubmission(values));
  }

  function applyAdminPreset(preset: AdminPreset) {
    setAdminMode(true);
    setValues(preset.values);
    setAttemptedSteps(new Set());
    setSubmitted(null);
    setReviewOpen(false);
    setMaxStepReached(steps.length - 1);
    setStepIndex(steps.length - 1);
  }

  function markStepAttempted(step: StepId) {
    setAttemptedSteps((current) => {
      const next = new Set(current);
      next.add(step);
      return next;
    });
  }

  function scrollMobileToTop() {
    if (!globalThis.matchMedia?.("(max-width: 639px)").matches) {
      return;
    }

    requestAnimationFrame(() => {
      shellRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  if (submitted) {
    return <SubmittedState submitted={submitted} />;
  }

  const stepContent = (
    <div className="p-5 sm:p-7">
      {currentStep.id === "contact" ? (
        <ContactStep
          values={values}
          updateValue={updateValue}
          errors={currentStepErrors}
        />
      ) : null}

      {currentStep.id === "intent" ? (
        <IntentStep
          values={values}
          updateValue={updateValue}
          toggleTryingToSolve={toggleTryingToSolve}
          errors={currentStepErrors}
        />
      ) : null}

      {currentStep.id === "profile" ? (
        <ProfileStep
          values={values}
          updateValue={updateValue}
          errors={currentStepErrors}
        />
      ) : null}

      {currentStep.id === "commercial" ? (
        <CommercialStep
          values={values}
          updateValue={updateValue}
          errors={currentStepErrors}
        />
      ) : null}
    </div>
  );

  return (
    <section
      ref={shellRef}
      className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-2 overflow-visible px-5 py-4 text-white sm:h-dvh sm:gap-4 sm:overflow-hidden sm:px-8 sm:py-6 lg:grid lg:grid-cols-[0.78fr_1.22fr] lg:gap-8 lg:px-10"
    >
      <StartHereSidebar
        stepIndex={stepIndex}
        completedSteps={completedSteps}
        availableSteps={availableSteps}
        adminAvailable={adminAvailable}
        adminMode={adminMode}
        presets={adminPresets}
        onStepSelect={goToStep}
        onAdminModeChange={setAdminMode}
        onPresetSelect={applyAdminPreset}
      />

      <form
        className="flex flex-col rounded-3xl border border-white/16 bg-white/12 p-4 shadow-2xl backdrop-blur-2xl sm:min-h-0 sm:flex-1 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          submitForm();
        }}
      >
        <div className="flex flex-col rounded-2xl border border-white/10 bg-[#0C0C2E]/45 sm:min-h-0 sm:flex-1 sm:overflow-hidden">
          <div className="border-b border-white/10 p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#B9B7FF]">
                  {currentStep.eyebrow}
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {getStepTitle(currentStep.id)}
                </h2>
              </div>
              <p className="hidden rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs text-white/65 sm:block">
                {stepIndex + 1} / {steps.length}
              </p>
            </div>
          </div>

          <ScrollArea className="min-h-0 sm:flex-1">{stepContent}</ScrollArea>
        </div>

        {currentStepHasErrors ? (
          <p className="mx-auto mt-4 max-w-md text-center text-sm font-medium text-rose-100">
            Please complete the highlighted fields before continuing.
          </p>
        ) : null}

        <div className="mt-4 flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-white/12 bg-[#090923]/80 p-3 shadow-2xl backdrop-blur-xl">
          <Button
            type="button"
            variant="ghost"
            className="h-11 rounded-xl px-4 text-white hover:bg-white/10 hover:text-white"
            onClick={goBack}
            disabled={stepIndex === 0}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Button
            type="button"
            className="h-11 rounded-xl bg-[#1E1E1E] px-5 text-white hover:bg-[#111]"
            onClick={goNext}
          >
            {stepIndex === steps.length - 1 ? "Complete" : "Continue"}
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm the intake</DialogTitle>
              <DialogDescription>
                Review your answers before continuing.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(100dvh-18rem)] min-h-0">
              <div className="pr-3">
                <ReviewStep values={values} errors={validation.errors} />
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                className="h-11 rounded-xl px-4 text-white hover:bg-white/10 hover:text-white"
                onClick={() => setReviewOpen(false)}
              >
                Keep editing
              </Button>
              <Button
                type="button"
                className="h-11 rounded-xl bg-white px-5 font-semibold text-[#2422A1] hover:bg-white/90"
                onClick={submitForm}
              >
                Confirm and continue
                <ArrowRight className="size-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </section>
  );
}

function useAdminAvailable() {
  return useSyncExternalStore(
    subscribeToLocationChanges,
    getAdminAvailableSnapshot,
    () => false
  );
}

function subscribeToLocationChanges(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);

  return () => window.removeEventListener("popstate", onStoreChange);
}

function getAdminAvailableSnapshot() {
  return new URLSearchParams(window.location.search).get("admin") === "1";
}
