import { z } from "zod";

import {
  deriveStartHereRoute,
  getEffectiveLeadSourceDetail,
} from "./start-here-routing";

export const PLACEHOLDERS = {
  clickUpListId: "PLACEHOLDER_CLICKUP_CRM_LIST_ID",
  erikCalendarUrl: "https://cal.com/erik-redomiciled/30min",
  willCalendarUrl: "https://cal.com/william-denton-redomiciled/30min",
} as const;

export const leadSourceDetails = [
  "Community Member",
  "Past Client",
  "Warm Referral",
  "Partner Referral",
  "Cold Ad",
  "Other",
] as const;

export const consideringSpecificStructureOptions = [
  "Yes — I know what structure I want, or I know I need a bank account",
  "No — I want help finding the right path",
  "I just want to check my current structure is compliant",
] as const;

export const tryingToSolveOptions = [
  "Relocate my individual tax residency",
  "Set up a new entity that suits me better",
  "Get a second passport",
  "New bank account",
  "Help with a crypto transaction",
  "Check if my current structure is compliant",
  "Diversify my assets globally without changing where I live",
] as const;

export const setupMaturityOptions = [
  "New to this — first time moving abroad / first experience with the offshore world",
  "Partially set up — I have some international structure but want to improve it",
  "Sophisticated setup — I have established structures and need specific expert help",
] as const;

export const monthlyRevenueBandOptions = [
  "$0–$5k / month",
  "$5k–$25k / month",
  "$25k–$100k / month",
  "$100k–$1M / month",
  "$1M+ / month",
] as const;

export const netWorthBandOptions = [
  "$0–$50k",
  "$50k–$250k",
  "$250k–$1M",
  "$1M–$5M",
  "$5M–$20M",
  "$20M+",
] as const;

export const timelineToActOptions = [
  "ASAP / 0–3 months",
  "3–6 months",
  "6+ months",
  "Just exploring",
] as const;

export const budgetReadinessOptions = [
  "Yes",
  "Maybe, if the fit is clear",
  "No",
] as const;

export const startHereFormRouteOptions = [
  "Unqualified / Not Ready",
  "Booked Call",
  "Manual Triage",
] as const;

export const routingDecisionSignalOptions = [
  "Warm source",
  "Known product/path",
  "Complex / Guidance-led",
  "Mixed / Unclear answers",
  "No clear path",
  "Low commercial signal",
  "Urgent low commercial signal",
  "Budget readiness rescue",
] as const;

export type LeadSourceDetail = (typeof leadSourceDetails)[number];
export type ConsideringSpecificStructure =
  (typeof consideringSpecificStructureOptions)[number];
export type TryingToSolve = (typeof tryingToSolveOptions)[number];
export type SetupMaturity = (typeof setupMaturityOptions)[number];
export type MonthlyRevenueBand = (typeof monthlyRevenueBandOptions)[number];
export type NetWorthBand = (typeof netWorthBandOptions)[number];
export type TimelineToAct = (typeof timelineToActOptions)[number];
export type BudgetReadiness = (typeof budgetReadinessOptions)[number];
export type StartHereFormRoute = (typeof startHereFormRouteOptions)[number];
export type RoutingDecisionSignal =
  (typeof routingDecisionSignalOptions)[number];

const emptyString = z.literal("");

export const startHereFormSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string(),
    leadSourceDetail: z.enum(leadSourceDetails),
    referralDetail: z.string(),
    consideringSpecificStructure: z.union([
      z.enum(consideringSpecificStructureOptions),
      emptyString,
    ]),
    tryingToSolve: z.array(z.enum(tryingToSolveOptions)),
    setupMaturity: z.union([z.enum(setupMaturityOptions), emptyString]),
    currentResidence: z.string(),
    passportsCitizenships: z.string(),
    businessMainSourceOfIncome: z.boolean().nullable(),
    monthlyRevenueBand: z.union([
      z.enum(monthlyRevenueBandOptions),
      emptyString,
    ]),
    netWorthBand: z.union([z.enum(netWorthBandOptions), emptyString]),
    timelineToAct: z.union([z.enum(timelineToActOptions), emptyString]),
    budgetReadiness: z.union([z.enum(budgetReadinessOptions), emptyString]),
    importantRoutingNotes: z.string(),
  })
  .superRefine((values, context) => {
    if (!values.firstName.trim()) {
      addFieldIssue(context, "firstName", "First name is required.");
    }

    if (!values.lastName.trim()) {
      addFieldIssue(context, "lastName", "Last name is required.");
    }

    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      addFieldIssue(context, "email", "Enter a valid email address.");
    }

    if (!values.phone.trim()) {
      addFieldIssue(context, "phone", "Phone is required.");
    }

    if (!values.consideringSpecificStructure) {
      addFieldIssue(
        context,
        "consideringSpecificStructure",
        "Choose one option."
      );
    }

    if (values.tryingToSolve.length === 0) {
      addFieldIssue(context, "tryingToSolve", "Choose at least one area.");
    }

    if (!values.setupMaturity) {
      addFieldIssue(
        context,
        "setupMaturity",
        "Choose your current setup stage."
      );
    }

    if (!values.currentResidence.trim()) {
      addFieldIssue(
        context,
        "currentResidence",
        "Current residence is required."
      );
    }

    if (!values.passportsCitizenships.trim()) {
      addFieldIssue(
        context,
        "passportsCitizenships",
        "Passport or citizenship details are required."
      );
    }

    if (values.businessMainSourceOfIncome === null) {
      addFieldIssue(context, "businessMainSourceOfIncome", "Choose yes or no.");
    }

    if (values.businessMainSourceOfIncome && !values.monthlyRevenueBand) {
      addFieldIssue(
        context,
        "monthlyRevenueBand",
        "Choose a monthly revenue band."
      );
    }

    if (!values.netWorthBand) {
      addFieldIssue(context, "netWorthBand", "Choose a net worth band.");
    }

    if (!values.timelineToAct) {
      addFieldIssue(context, "timelineToAct", "Choose a timeline.");
    }

    if (!values.budgetReadiness) {
      addFieldIssue(
        context,
        "budgetReadiness",
        "Choose a budget readiness answer."
      );
    }
  });

export type StartHereFormValues = z.infer<typeof startHereFormSchema>;

export type StartHerePreparedSubmission = {
  target: {
    clickUpListId: typeof PLACEHOLDERS.clickUpListId;
    matchingKey: "email";
  };
  fields: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    leadSource: "Start Here Form";
    leadSourceDetail: LeadSourceDetail;
    referralDetail?: string;
    warmOverride: boolean;
    consideringSpecificStructure: ConsideringSpecificStructure;
    tryingToSolve: TryingToSolve[];
    setupMaturity: SetupMaturity;
    currentResidence: string;
    passportsCitizenships: string;
    businessMainSourceOfIncome: boolean;
    monthlyRevenueBand: MonthlyRevenueBand | "Not applicable";
    netWorthBand: NetWorthBand;
    timelineToAct: TimelineToAct;
    budgetReadiness: BudgetReadiness;
    importantRoutingNotes?: string;
    startHereFormRoute: StartHereFormRoute;
    startHereFormRouteReason: string;
    routingDecisionSignals: RoutingDecisionSignal[];
    bookedCallOwner: "Erik" | "Will" | "Not assigned";
    calendarUrl: string;
    calComBookingId: "";
  };
};

export const emptyStartHereFormValues: StartHereFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  leadSourceDetail: "Other",
  referralDetail: "",
  consideringSpecificStructure: "",
  tryingToSolve: [],
  setupMaturity: "",
  currentResidence: "",
  passportsCitizenships: "",
  businessMainSourceOfIncome: null,
  monthlyRevenueBand: "",
  netWorthBand: "",
  timelineToAct: "",
  budgetReadiness: "",
  importantRoutingNotes: "",
};

export type ValidationResult = {
  ok: boolean;
  errors: Partial<Record<keyof StartHereFormValues, string>>;
};

export function validateStartHereValues(
  values: StartHereFormValues
): ValidationResult {
  const errors: Partial<Record<keyof StartHereFormValues, string>> = {};
  const result = startHereFormSchema.safeParse(values);

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0];

      if (typeof field === "string" && isStartHereField(field)) {
        errors[field] ??= issue.message;
      }
    }
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}

export function prepareStartHereSubmission(
  values: StartHereFormValues
): StartHerePreparedSubmission {
  const leadSourceDetail = getEffectiveLeadSourceDetail(values);
  const route = deriveStartHereRoute(values);
  const warmOverride = route.routingDecisionSignals.includes("Warm source");

  return {
    target: {
      clickUpListId: PLACEHOLDERS.clickUpListId,
      matchingKey: "email",
    },
    fields: {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
      leadSource: "Start Here Form",
      leadSourceDetail,
      ...(values.referralDetail.trim()
        ? { referralDetail: values.referralDetail.trim() }
        : {}),
      warmOverride,
      consideringSpecificStructure: requireValue(
        values.consideringSpecificStructure
      ),
      tryingToSolve: values.tryingToSolve,
      setupMaturity: requireValue(values.setupMaturity),
      currentResidence: values.currentResidence.trim(),
      passportsCitizenships: values.passportsCitizenships.trim(),
      businessMainSourceOfIncome: values.businessMainSourceOfIncome === true,
      monthlyRevenueBand: values.businessMainSourceOfIncome
        ? requireValue(values.monthlyRevenueBand)
        : "Not applicable",
      netWorthBand: requireValue(values.netWorthBand),
      timelineToAct: requireValue(values.timelineToAct),
      budgetReadiness: requireValue(values.budgetReadiness),
      ...(values.importantRoutingNotes.trim()
        ? { importantRoutingNotes: values.importantRoutingNotes.trim() }
        : {}),
      startHereFormRoute: route.startHereFormRoute,
      startHereFormRouteReason: route.startHereFormRouteReason,
      routingDecisionSignals: route.routingDecisionSignals,
      bookedCallOwner: route.bookedCallOwner,
      calendarUrl: route.calendarUrl,
      calComBookingId: "",
    },
  };
}

function requireValue<T>(value: T | ""): T {
  if (value === "") {
    throw new Error("Cannot prepare submission with missing required values.");
  }

  return value;
}

function addFieldIssue(
  context: z.RefinementCtx,
  field: keyof StartHereFormValues,
  message: string
) {
  context.addIssue({
    code: "custom",
    message,
    path: [field],
  });
}

function isStartHereField(field: string): field is keyof StartHereFormValues {
  return field in emptyStartHereFormValues;
}
