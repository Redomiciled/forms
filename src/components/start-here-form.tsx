"use client";

import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
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
  tryingToSolveOptions,
  validateStartHereValues,
  type StartHereFormValues,
} from "@/lib/start-here";
import { adminPresets, type AdminPreset } from "@/lib/start-here-admin";
import type {
  StartHereSubmissionResponse,
  StartHereSubmissionSuccessResponse,
} from "@/lib/start-here-submission";

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
    useState<StartHereSubmissionSuccessResponse | null>(null);
  const [resubmissionTaskId, setResubmissionTaskId] = useState<string | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
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

  async function submitForm() {
    if (submitting) {
      return;
    }

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

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(getSubmissionEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values,
          adminMode,
          qaMode: adminMode,
          ...(resubmissionTaskId ? { taskId: resubmissionTaskId } : {}),
        }),
      });
      const result = (await response.json()) as StartHereSubmissionResponse;

      if (!response.ok || !result.ok) {
        throw new Error(
          !result.ok
            ? result.error.message
            : "We could not submit the form. Please try again."
        );
      }

      setSubmitted(result);
      setResubmissionTaskId(result.persistence.taskId ?? null);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not submit the form. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function applyAdminPreset(preset: AdminPreset) {
    setAdminMode(true);
    setValues(preset.values);
    setAttemptedSteps(new Set());
    setSubmitted(null);
    setResubmissionTaskId(null);
    setSubmitError("");
    setReviewOpen(false);
    setMaxStepReached(steps.length - 1);
    setStepIndex(steps.length - 1);
  }

  function reviewSubmittedAnswers() {
    setResubmissionTaskId(submitted?.persistence.taskId ?? null);
    setSubmitted(null);
    setSubmitError("");
    setReviewOpen(true);
    setMaxStepReached(steps.length - 1);
    setStepIndex(steps.length - 1);
    scrollMobileToTop();
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
    return (
      <SubmittedState
        submitted={submitted}
        onReviewAnswers={reviewSubmittedAnswers}
      />
    );
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
      className="text-ink mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-2 overflow-visible px-5 py-4 sm:h-dvh sm:gap-4 sm:overflow-hidden sm:px-8 sm:py-6 lg:grid lg:grid-cols-[0.78fr_1.22fr] lg:gap-8 lg:px-10"
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
        className="border-line bg-mist flex flex-col rounded-3xl border p-4 shadow-lg sm:min-h-0 sm:flex-1 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          submitForm();
        }}
      >
        <div className="border-line bg-paper flex flex-col rounded-2xl border sm:min-h-0 sm:flex-1 sm:overflow-hidden">
          <div className="border-line border-b p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-brand text-sm font-medium">
                  {currentStep.eyebrow}
                </p>
                <h2 className="font-heading text-ink mt-1 text-2xl font-medium">
                  {getStepTitle(currentStep.id)}
                </h2>
              </div>
              <p className="border-line bg-mist text-stone hidden rounded-full border px-3 py-1 text-xs sm:block">
                {stepIndex + 1} / {steps.length}
              </p>
            </div>
          </div>

          <ScrollArea className="min-h-0 sm:flex-1">{stepContent}</ScrollArea>
        </div>

        {currentStepHasErrors ? (
          <p className="mx-auto mt-4 max-w-md text-center text-sm font-medium text-red-600">
            Please complete the highlighted fields before continuing.
          </p>
        ) : null}

        <div className="border-line bg-paper mt-4 flex shrink-0 items-center justify-between gap-3 rounded-2xl border p-3 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            className="text-ink hover:bg-mist hover:text-brand h-11 rounded-xl px-4"
            onClick={goBack}
            disabled={stepIndex === 0}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Button
            type="button"
            className="bg-brand text-paper hover:bg-brand-deep h-11 rounded-xl px-5"
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
              {submitError ? (
                <p className="text-sm leading-5 text-red-600">{submitError}</p>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                className="text-ink hover:bg-mist hover:text-brand h-11 rounded-xl px-4"
                onClick={() => setReviewOpen(false)}
                disabled={submitting}
              >
                Keep editing
              </Button>
              <Button
                type="button"
                className="bg-brand text-paper hover:bg-brand-deep h-11 rounded-xl px-5 font-semibold"
                onClick={submitForm}
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <LoaderCircle
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    Confirm and continue
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </section>
  );
}

function getSubmissionEndpoint() {
  const source = new URLSearchParams(globalThis.location.search).get("source");

  if (source !== "landing_page") {
    return "/api/start-here/submissions";
  }

  return "/api/start-here/submissions?source=landing_page";
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
