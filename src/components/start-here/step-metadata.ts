import type { StartHereFormValues } from "@/lib/start-here";

export type StepId = "contact" | "intent" | "profile" | "commercial";

export const steps: Array<{ id: StepId; label: string; eyebrow: string }> = [
  {
    id: "contact",
    label: "Contact Info",
    eyebrow: "Step 1",
  },
  { id: "intent", label: "What path are you exploring?", eyebrow: "Step 2" },
  { id: "profile", label: "Where are you starting from?", eyebrow: "Step 3" },
  { id: "commercial", label: "Commercial readiness", eyebrow: "Step 4" },
];

export const stepFields: Record<StepId, Array<keyof StartHereFormValues>> = {
  contact: ["firstName", "lastName", "email", "phone"],
  intent: ["consideringSpecificStructure", "tryingToSolve"],
  profile: ["setupMaturity", "currentResidence", "passportsCitizenships"],
  commercial: [
    "businessMainSourceOfIncome",
    "monthlyRevenueBand",
    "netWorthBand",
    "timelineToAct",
    "budgetReadiness",
  ],
};

export function getStepTitle(step: StepId) {
  switch (step) {
    case "contact":
      return "Contact";
    case "intent":
      return "What path are you exploring?";
    case "profile":
      return "Where are you starting from?";
    case "commercial":
      return "Commercial readiness";
  }
}

export function getStepErrors(
  step: StepId,
  errors: Partial<Record<keyof StartHereFormValues, string>>
) {
  const stepErrors: Partial<Record<keyof StartHereFormValues, string>> = {};

  for (const field of stepFields[step]) {
    if (errors[field]) {
      stepErrors[field] = errors[field];
    }
  }

  return stepErrors;
}

export function isStepValid(
  step: StepId,
  errors: Partial<Record<keyof StartHereFormValues, string>>
) {
  return Object.keys(getStepErrors(step, errors)).length === 0;
}

export function getFirstErrorStep(
  errors: Partial<Record<keyof StartHereFormValues, string>>
): StepId {
  const fields = Object.keys(errors) as Array<keyof StartHereFormValues>;
  const first = fields[0];

  if (
    first === "firstName" ||
    first === "lastName" ||
    first === "email" ||
    first === "phone"
  ) {
    return "contact";
  }

  if (first === "consideringSpecificStructure" || first === "tryingToSolve") {
    return "intent";
  }

  if (
    first === "setupMaturity" ||
    first === "currentResidence" ||
    first === "passportsCitizenships"
  ) {
    return "profile";
  }

  return "commercial";
}
