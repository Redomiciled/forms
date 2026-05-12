export const PLACEHOLDERS = {
  clickUpListId: "PLACEHOLDER_CLICKUP_CRM_LIST_ID",
  erikCalendarUrl: "PLACEHOLDER_CAL_COM_ERIK_URL",
  willCalendarUrl: "PLACEHOLDER_CAL_COM_WILL_URL",
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
  "Yes - knows structure or bank need",
  "No - needs path guidance",
  "Compliance check",
] as const;

export const tryingToSolveOptions = [
  "Relocate tax residency",
  "New entity",
  "Second passport",
  "New bank account",
  "Crypto transaction",
  "Structure compliance check",
  "Diversify assets without moving",
] as const;

export const setupMaturityOptions = [
  "New to this",
  "Partially set up",
  "Sophisticated setup",
] as const;

export const monthlyRevenueBandOptions = [
  "$0-$5k/month",
  "$5k-$25k/month",
  "$25k-$100k/month",
  "$100k-$1M/month",
  "$1M+/month",
] as const;

export const netWorthBandOptions = [
  "$0-$50k",
  "$50k-$250k",
  "$250k-$1M",
  "$1M-$5M",
  "$5M-$20M",
  "$20M+",
] as const;

export const timelineToActOptions = [
  "ASAP / 0-3 months",
  "3-6 months",
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

export type StartHereFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  leadSourceDetail: LeadSourceDetail | "";
  referralDetail: string;
  consideringSpecificStructure: ConsideringSpecificStructure | "";
  tryingToSolve: TryingToSolve[];
  setupMaturity: SetupMaturity | "";
  currentResidence: string;
  passportsCitizenships: string;
  businessMainSourceOfIncome: boolean | null;
  monthlyRevenueBand: MonthlyRevenueBand | "";
  netWorthBand: NetWorthBand | "";
  timelineToAct: TimelineToAct | "";
  budgetReadiness: BudgetReadiness | "";
  importantRoutingNotes: string;
};

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
  leadSourceDetail: "",
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

  if (!values.firstName.trim()) {
    errors.firstName = "First name is required.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Last name is required.";
  }

  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.phone.trim()) {
    errors.phone = "WhatsApp or phone is required.";
  }

  if (!values.leadSourceDetail) {
    errors.leadSourceDetail = "Choose the closest source.";
  }

  if (!values.consideringSpecificStructure) {
    errors.consideringSpecificStructure = "Choose one option.";
  }

  if (values.tryingToSolve.length === 0) {
    errors.tryingToSolve = "Choose at least one area.";
  }

  if (!values.setupMaturity) {
    errors.setupMaturity = "Choose your current setup stage.";
  }

  if (!values.currentResidence.trim()) {
    errors.currentResidence = "Current residence is required.";
  }

  if (!values.passportsCitizenships.trim()) {
    errors.passportsCitizenships =
      "Passport or citizenship details are required.";
  }

  if (values.businessMainSourceOfIncome === null) {
    errors.businessMainSourceOfIncome = "Choose yes or no.";
  }

  if (values.businessMainSourceOfIncome && !values.monthlyRevenueBand) {
    errors.monthlyRevenueBand = "Choose a monthly revenue band.";
  }

  if (!values.netWorthBand) {
    errors.netWorthBand = "Choose a net worth band.";
  }

  if (!values.timelineToAct) {
    errors.timelineToAct = "Choose a timeline.";
  }

  if (!values.budgetReadiness) {
    errors.budgetReadiness = "Choose a budget readiness answer.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}

export function prepareStartHereSubmission(
  values: StartHereFormValues
): StartHerePreparedSubmission {
  const warmOverride = [
    "Past Client",
    "Warm Referral",
    "Partner Referral",
  ].includes(values.leadSourceDetail);
  const isBankingIntent = values.tryingToSolve.includes("New bank account");

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
      leadSourceDetail: requireValue(values.leadSourceDetail),
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
      startHereFormRoute: "Manual Triage",
      startHereFormRouteReason:
        "Placeholder route for form-only v1. Final routing thresholds, ClickUp updates, and calendar display belong to the downstream automation slice.",
      routingDecisionSignals: deriveDecisionSignals(values, warmOverride),
      bookedCallOwner: isBankingIntent ? "Will" : "Not assigned",
      calendarUrl: isBankingIntent
        ? PLACEHOLDERS.willCalendarUrl
        : PLACEHOLDERS.erikCalendarUrl,
      calComBookingId: "",
    },
  };
}

function deriveDecisionSignals(
  values: StartHereFormValues,
  warmOverride: boolean
): RoutingDecisionSignal[] {
  const signals: RoutingDecisionSignal[] = [];

  if (warmOverride) {
    signals.push("Warm source");
  }

  if (
    values.consideringSpecificStructure ===
      "Yes - knows structure or bank need" ||
    values.tryingToSolve.includes("New bank account") ||
    values.tryingToSolve.includes("Second passport") ||
    values.tryingToSolve.includes("Crypto transaction")
  ) {
    signals.push("Known product/path");
  }

  if (
    values.consideringSpecificStructure === "No - needs path guidance" ||
    values.tryingToSolve.length > 2
  ) {
    signals.push("Complex / Guidance-led");
  }

  if (values.budgetReadiness === "Yes") {
    signals.push("Budget readiness rescue");
  }

  if (values.timelineToAct === "ASAP / 0-3 months") {
    signals.push("Urgent low commercial signal");
  }

  return signals.length > 0 ? signals : ["Mixed / Unclear answers"];
}

function requireValue<T>(value: T | ""): T {
  if (value === "") {
    throw new Error("Cannot prepare submission with missing required values.");
  }

  return value;
}
