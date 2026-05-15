import {
  emptyStartHereFormValues,
  type StartHereFormValues,
} from "./start-here";

export type AdminPresetId =
  | "booked-banking"
  | "booked-non-banking"
  | "manual-triage"
  | "unqualified"
  | "warm-referral";

export type AdminPreset = {
  id: AdminPresetId;
  label: string;
  values: StartHereFormValues;
};

export const adminPresets: AdminPreset[] = [
  {
    id: "booked-banking",
    label: "TEST - Booked call - banking",
    values: makePreset({
      consideringSpecificStructure:
        "Yes — I know what structure I want, or I know I need a bank account",
      tryingToSolve: ["New bank account"],
      monthlyRevenueBand: "$25k–$100k / month",
      netWorthBand: "$250k–$1M",
      budgetReadiness: "Maybe, if the fit is clear",
    }),
  },
  {
    id: "booked-non-banking",
    label: "TEST - Booked call - non-banking",
    values: makePreset({
      consideringSpecificStructure:
        "Yes — I know what structure I want, or I know I need a bank account",
      tryingToSolve: ["Get a second passport"],
      monthlyRevenueBand: "$0–$5k / month",
      netWorthBand: "$1M–$5M",
      budgetReadiness: "Maybe, if the fit is clear",
    }),
  },
  {
    id: "manual-triage",
    label: "TEST - Manual triage",
    values: makePreset({
      consideringSpecificStructure: "No — I want help finding the right path",
      tryingToSolve: ["Relocate my individual tax residency"],
      monthlyRevenueBand: "$100k–$1M / month",
      netWorthBand: "$5M–$20M",
      timelineToAct: "3–6 months",
      budgetReadiness: "Maybe, if the fit is clear",
    }),
  },
  {
    id: "unqualified",
    label: "TEST - Unqualified",
    values: makePreset({
      consideringSpecificStructure: "No — I want help finding the right path",
      tryingToSolve: [
        "Diversify my assets globally without changing where I live",
      ],
      businessMainSourceOfIncome: false,
      monthlyRevenueBand: "",
      netWorthBand: "$50k–$250k",
      timelineToAct: "Just exploring",
      budgetReadiness: "No",
    }),
  },
  {
    id: "warm-referral",
    label: "TEST - Warm referral",
    values: makePreset({
      referralDetail: "Introduced by Alex",
      consideringSpecificStructure: "No — I want help finding the right path",
      tryingToSolve: [
        "Diversify my assets globally without changing where I live",
      ],
      businessMainSourceOfIncome: false,
      monthlyRevenueBand: "",
      netWorthBand: "$0–$50k",
      timelineToAct: "Just exploring",
      budgetReadiness: "No",
    }),
  },
];

function makePreset(
  overrides: Partial<StartHereFormValues>
): StartHereFormValues {
  return {
    ...emptyStartHereFormValues,
    firstName: "TEST Taylor",
    lastName: "Rivera",
    email: "taylor@example.com",
    phone: "+1 555 0100",
    consideringSpecificStructure:
      "Yes — I know what structure I want, or I know I need a bank account",
    tryingToSolve: ["Get a second passport"],
    setupMaturity:
      "Partially set up — I have some international structure but want to improve it",
    currentResidence: "Argentina",
    passportsCitizenships: "United States",
    businessMainSourceOfIncome: true,
    monthlyRevenueBand: "$25k–$100k / month",
    netWorthBand: "$1M–$5M",
    timelineToAct: "ASAP / 0–3 months",
    budgetReadiness: "Maybe, if the fit is clear",
    ...overrides,
  };
}
