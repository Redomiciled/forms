"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  emptyStartHereFormValues,
  prepareStartHereSubmission,
  tryingToSolveOptions,
  validateStartHereValues,
  type StartHereFormValues,
  type StartHerePreparedSubmission,
} from "@/lib/start-here";

import {
  getFirstErrorStep,
  getStepTitle,
  steps,
} from "./start-here/step-metadata";
import { StartHereSidebar } from "./start-here/sidebar";
import { CommercialStep } from "./start-here/steps/commercial-step";
import { ContactStep } from "./start-here/steps/contact-step";
import { IntentStep } from "./start-here/steps/intent-step";
import { ProfileStep } from "./start-here/steps/profile-step";
import { ReviewStep } from "./start-here/steps/review-step";
import { SubmittedState } from "./start-here/submitted-state";

export function StartHereForm() {
  const [values, setValues] = useState<StartHereFormValues>(
    emptyStartHereFormValues
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] =
    useState<StartHerePreparedSubmission | null>(null);
  const validation = useMemo(() => validateStartHereValues(values), [values]);
  const currentStep = steps[stepIndex] ?? {
    id: "contact",
    label: "Contact",
    eyebrow: "Step 1",
  };

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
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  function submitForm() {
    const nextValidation = validateStartHereValues(values);

    if (!nextValidation.ok) {
      const firstErrorStep = getFirstErrorStep(nextValidation.errors);
      setStepIndex(steps.findIndex((step) => step.id === firstErrorStep));
      return;
    }

    setSubmitted(prepareStartHereSubmission(values));
  }

  if (submitted) {
    return (
      <SubmittedState submitted={submitted} onEdit={() => setSubmitted(null)} />
    );
  }

  return (
    <section className="mx-auto flex h-dvh w-full max-w-7xl flex-col gap-4 overflow-hidden px-5 py-4 text-white sm:px-8 sm:py-6 lg:grid lg:grid-cols-[0.78fr_1.22fr] lg:gap-8 lg:px-10">
      <StartHereSidebar stepIndex={stepIndex} />

      <form
        className="flex min-h-0 flex-1 flex-col rounded-3xl border border-white/16 bg-white/12 p-4 shadow-2xl backdrop-blur-2xl sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          submitForm();
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0C0C2E]/45">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-7">
            <div>
              <p className="text-sm font-medium text-[#B9B7FF]">
                {currentStep.eyebrow}
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                {getStepTitle(currentStep.id)}
              </h2>
            </div>
            <p className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs text-white/65">
              {stepIndex + 1} / {steps.length}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
            {currentStep.id === "contact" ? (
              <ContactStep values={values} updateValue={updateValue} />
            ) : null}

            {currentStep.id === "intent" ? (
              <IntentStep
                values={values}
                updateValue={updateValue}
                toggleTryingToSolve={toggleTryingToSolve}
              />
            ) : null}

            {currentStep.id === "profile" ? (
              <ProfileStep values={values} updateValue={updateValue} />
            ) : null}

            {currentStep.id === "commercial" ? (
              <CommercialStep values={values} updateValue={updateValue} />
            ) : null}

            {currentStep.id === "review" ? (
              <ReviewStep values={values} errors={validation.errors} />
            ) : null}
          </div>
        </div>

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
          {stepIndex < steps.length - 1 ? (
            <Button
              type="button"
              className="h-11 rounded-xl bg-[#1E1E1E] px-5 text-white hover:bg-[#111]"
              onClick={goNext}
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="h-11 rounded-xl bg-white px-5 font-semibold text-[#2422A1] hover:bg-white/90"
            >
              Prepare submission
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}
