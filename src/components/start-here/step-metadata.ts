import type { StartHereFormValues } from "@/lib/start-here";

export type StepId = "contact" | "intent" | "profile" | "commercial" | "review";

export const steps: Array<{ id: StepId; label: string; eyebrow: string }> = [
  { id: "contact", label: "Contact", eyebrow: "Step 1" },
  { id: "intent", label: "Intent", eyebrow: "Step 2" },
  { id: "profile", label: "Profile", eyebrow: "Step 3" },
  { id: "commercial", label: "Readiness", eyebrow: "Step 4" },
  { id: "review", label: "Review", eyebrow: "Step 5" },
];

export function getStepTitle(step: StepId) {
  switch (step) {
    case "contact":
      return "How can Redomiciled reach you?";
    case "intent":
      return "What path are you exploring?";
    case "profile":
      return "Where are you starting from?";
    case "commercial":
      return "Commercial readiness";
    case "review":
      return "Confirm the intake";
  }
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
    first === "phone" ||
    first === "leadSourceDetail"
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
