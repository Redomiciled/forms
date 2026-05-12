import {
  type LeadSourceDetail,
  type RoutingDecisionSignal,
  type StartHereFormRoute,
  type StartHereFormValues,
} from "./start-here";

const CALENDAR_URLS = {
  erik: "PLACEHOLDER_CAL_COM_ERIK_URL",
  will: "PLACEHOLDER_CAL_COM_WILL_URL",
} as const;

export type StartHereRouteResult = {
  startHereFormRoute: StartHereFormRoute;
  startHereFormRouteReason: string;
  routingDecisionSignals: RoutingDecisionSignal[];
  bookedCallOwner: "Erik" | "Will" | "Not assigned";
  calendarUrl: string;
};

export function getEffectiveLeadSourceDetail(
  values: StartHereFormValues
): LeadSourceDetail {
  return values.referralDetail.trim()
    ? "Warm Referral"
    : values.leadSourceDetail;
}

export function deriveStartHereRoute(
  values: StartHereFormValues
): StartHereRouteResult {
  const signals = deriveRoutingDecisionSignals(values);
  const hasSpecificPath = hasSpecificProductPath(values);
  const hasComplex = hasComplexIntent(values);
  const warm = isWarmLead(values);
  const urgent = values.timelineToAct === "ASAP / 0–3 months";
  const lowUrgency =
    values.timelineToAct === "6+ months" ||
    values.timelineToAct === "Just exploring";
  const lowRevenue =
    !values.businessMainSourceOfIncome || revenueBelow10k(values);
  const lowCommercial = lowRevenue && netWorthBelow250k(values);
  const productCommercialFit =
    (values.businessMainSourceOfIncome && revenueAtLeast10k(values)) ||
    netWorthAtLeast1M(values);
  const complexCommercialFit =
    (values.businessMainSourceOfIncome && revenueAtLeast25k(values)) ||
    netWorthAtLeast1M(values);

  if (warm) {
    if (hasSpecificPath && productCommercialFit) {
      return bookedCall(
        values,
        signals,
        "Warm lead with clear product/path intent and enough commercial signal."
      );
    }

    return manualTriage(
      signals,
      "Warm lead should not be auto-disqualified; route for relationship-aware review."
    );
  }

  if (hasSpecificPath && productCommercialFit) {
    return bookedCall(
      values,
      signals,
      "Specific product/path intent with enough revenue or net worth signal."
    );
  }

  if (hasSpecificPath && !productCommercialFit && urgent) {
    return bookedCall(
      values,
      signals,
      "Specific product/path intent is urgent, so it should not be hard-disqualified on commercial signal alone."
    );
  }

  if (
    !hasSpecificPath &&
    ((values.businessMainSourceOfIncome && revenueAtLeast50k(values)) ||
      netWorthAtLeast5M(values))
  ) {
    return manualTriage(
      signals,
      "High commercial signal with mixed or unclear answers should go to internal review."
    );
  }

  if (hasComplex && complexCommercialFit) {
    return bookedCall(
      values,
      signals,
      "Complex or guidance-led intent with enough revenue or net worth signal."
    );
  }

  if (lowCommercial && lowUrgency) {
    if (values.budgetReadiness === "Yes") {
      if (hasSpecificPath) {
        return bookedCall(
          values,
          signals,
          "Low commercial signal and low urgency, but budget readiness plus clear path allows a call."
        );
      }

      return manualTriage(
        signals,
        "Low commercial signal and low urgency, but budget readiness warrants review."
      );
    }

    if (values.budgetReadiness === "Maybe, if the fit is clear") {
      return manualTriage(
        signals,
        "Low commercial signal and low urgency with uncertain budget readiness."
      );
    }

    return unqualified(
      signals,
      "Low commercial signal, low urgency, and not ready to invest at the minimum professional fee level."
    );
  }

  if (lowCommercial && urgent) {
    if (hasSpecificPath) {
      return bookedCall(
        values,
        signals,
        "Urgent low-commercial lead with clear product/path intent."
      );
    }

    return manualTriage(
      signals,
      "Urgent low-commercial lead should be reviewed instead of hard-disqualified."
    );
  }

  if (
    hasNoClearPath(values) &&
    revenueBelow25k(values) &&
    !netWorthAtLeast1M(values) &&
    values.budgetReadiness !== "Yes"
  ) {
    return unqualified(
      signals,
      "No clear product/path and low commercial fit without budget readiness."
    );
  }

  return manualTriage(
    signals,
    "Answers indicate possible value but do not produce a clear automated route."
  );
}

export function deriveRoutingDecisionSignals(
  values: StartHereFormValues
): RoutingDecisionSignal[] {
  const signals: RoutingDecisionSignal[] = [];

  if (isWarmLead(values)) {
    signals.push("Warm source");
  }

  if (hasSpecificProductPath(values)) {
    signals.push("Known product/path");
  }

  if (hasComplexIntent(values)) {
    signals.push("Complex / Guidance-led");
  }

  if (hasNoClearPath(values)) {
    signals.push("No clear path");
  }

  if (
    (!values.businessMainSourceOfIncome || revenueBelow10k(values)) &&
    netWorthBelow250k(values)
  ) {
    signals.push("Low commercial signal");
  }

  if (values.timelineToAct === "ASAP / 0–3 months") {
    signals.push("Urgent low commercial signal");
  }

  if (values.budgetReadiness === "Yes") {
    signals.push("Budget readiness rescue");
  }

  return signals.length > 0 ? signals : ["Mixed / Unclear answers"];
}

export function hasBankingIntent(values: StartHereFormValues) {
  return values.tryingToSolve.includes("New bank account");
}

export function hasSpecificProductPath(values: StartHereFormValues) {
  return (
    values.consideringSpecificStructure ===
      "Yes — I know what structure I want, or I know I need a bank account" ||
    values.tryingToSolve.includes("New bank account") ||
    values.tryingToSolve.includes("Get a second passport") ||
    values.tryingToSolve.includes("Help with a crypto transaction")
  );
}

export function hasGuidanceLedIntent(values: StartHereFormValues) {
  return (
    values.consideringSpecificStructure ===
    "No — I want help finding the right path"
  );
}

export function hasComplexIntent(values: StartHereFormValues) {
  return (
    hasGuidanceLedIntent(values) ||
    values.consideringSpecificStructure ===
      "I just want to check my current structure is compliant" ||
    values.tryingToSolve.length > 2
  );
}

export function hasNoClearPath(values: StartHereFormValues) {
  return !hasSpecificProductPath(values);
}

export function isWarmLead(values: StartHereFormValues) {
  const source = getEffectiveLeadSourceDetail(values);

  return (
    source === "Past Client" ||
    source === "Warm Referral" ||
    source === "Partner Referral"
  );
}

export function revenueAtLeast10k(values: StartHereFormValues) {
  return (
    values.monthlyRevenueBand !== "" &&
    values.monthlyRevenueBand !== "$0–$5k / month"
  );
}

export function revenueAtLeast25k(values: StartHereFormValues) {
  return (
    values.monthlyRevenueBand === "$25k–$100k / month" ||
    values.monthlyRevenueBand === "$100k–$1M / month" ||
    values.monthlyRevenueBand === "$1M+ / month"
  );
}

export function revenueAtLeast50k(values: StartHereFormValues) {
  return revenueAtLeast25k(values);
}

export function revenueBelow10k(values: StartHereFormValues) {
  return (
    values.monthlyRevenueBand === "" ||
    values.monthlyRevenueBand === "$0–$5k / month"
  );
}

export function revenueBelow25k(values: StartHereFormValues) {
  return (
    values.monthlyRevenueBand === "" ||
    values.monthlyRevenueBand === "$0–$5k / month" ||
    values.monthlyRevenueBand === "$5k–$25k / month"
  );
}

export function netWorthAtLeast1M(values: StartHereFormValues) {
  return (
    values.netWorthBand === "$1M–$5M" ||
    values.netWorthBand === "$5M–$20M" ||
    values.netWorthBand === "$20M+"
  );
}

export function netWorthAtLeast5M(values: StartHereFormValues) {
  return values.netWorthBand === "$5M–$20M" || values.netWorthBand === "$20M+";
}

export function netWorthBelow250k(values: StartHereFormValues) {
  return (
    values.netWorthBand === "$0–$50k" || values.netWorthBand === "$50k–$250k"
  );
}

function bookedCall(
  values: StartHereFormValues,
  signals: RoutingDecisionSignal[],
  reason: string
): StartHereRouteResult {
  const owner = hasBankingIntent(values) ? "Will" : "Erik";

  return {
    startHereFormRoute: "Booked Call",
    startHereFormRouteReason: reason,
    routingDecisionSignals: signals,
    bookedCallOwner: owner,
    calendarUrl: owner === "Will" ? CALENDAR_URLS.will : CALENDAR_URLS.erik,
  };
}

function manualTriage(
  signals: RoutingDecisionSignal[],
  reason: string
): StartHereRouteResult {
  return {
    startHereFormRoute: "Manual Triage",
    startHereFormRouteReason: reason,
    routingDecisionSignals: signals,
    bookedCallOwner: "Not assigned",
    calendarUrl: "",
  };
}

function unqualified(
  signals: RoutingDecisionSignal[],
  reason: string
): StartHereRouteResult {
  return {
    startHereFormRoute: "Unqualified / Not Ready",
    startHereFormRouteReason: reason,
    routingDecisionSignals: signals,
    bookedCallOwner: "Not assigned",
    calendarUrl: "",
  };
}
