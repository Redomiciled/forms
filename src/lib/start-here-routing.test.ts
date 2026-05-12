import { describe, expect, it } from "vitest";

import {
  emptyStartHereFormValues,
  prepareStartHereSubmission,
  type StartHereFormValues,
} from "./start-here";
import { deriveStartHereRoute } from "./start-here-routing";

describe("deriveStartHereRoute", () => {
  it("routes clear banking intent with commercial signal to Will's booked call", () => {
    const route = deriveStartHereRoute(
      makeValues({
        consideringSpecificStructure:
          "Yes — I know what structure I want, or I know I need a bank account",
        tryingToSolve: ["New bank account"],
        monthlyRevenueBand: "$25k–$100k / month",
        netWorthBand: "$250k–$1M",
      })
    );

    expect(route.startHereFormRoute).toBe("Booked Call");
    expect(route.bookedCallOwner).toBe("Will");
    expect(route.calendarUrl).toBe(
      "https://cal.com/juan-hernandez-obduvq/30min"
    );
    expect(route.routingDecisionSignals).toContain("Known product/path");
  });

  it("routes clear non-banking intent with net worth signal to Erik's booked call", () => {
    const route = deriveStartHereRoute(
      makeValues({
        consideringSpecificStructure:
          "Yes — I know what structure I want, or I know I need a bank account",
        tryingToSolve: ["Get a second passport"],
        monthlyRevenueBand: "$0–$5k / month",
        netWorthBand: "$1M–$5M",
      })
    );

    expect(route.startHereFormRoute).toBe("Booked Call");
    expect(route.bookedCallOwner).toBe("Erik");
    expect(route.calendarUrl).toBe(
      "https://cal.com/juan-hernandez-obduvq/30min"
    );
  });

  it("routes warm low-fit leads to manual triage instead of unqualified", () => {
    const route = deriveStartHereRoute(
      makeValues({
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
      })
    );

    expect(route.startHereFormRoute).toBe("Manual Triage");
    expect(route.calendarUrl).toBe("");
    expect(route.routingDecisionSignals).toContain("Warm source");
  });

  it("routes low commercial, low urgency, budget-no leads to unqualified", () => {
    const route = deriveStartHereRoute(
      makeValues({
        consideringSpecificStructure: "No — I want help finding the right path",
        tryingToSolve: [
          "Diversify my assets globally without changing where I live",
        ],
        businessMainSourceOfIncome: false,
        monthlyRevenueBand: "",
        netWorthBand: "$50k–$250k",
        timelineToAct: "6+ months",
        budgetReadiness: "No",
      })
    );

    expect(route.startHereFormRoute).toBe("Unqualified / Not Ready");
    expect(route.calendarUrl).toBe("");
    expect(route.routingDecisionSignals).toContain("Low commercial signal");
  });

  it("does not auto-disqualify urgent low-commercial leads with clear intent", () => {
    const route = deriveStartHereRoute(
      makeValues({
        consideringSpecificStructure:
          "Yes — I know what structure I want, or I know I need a bank account",
        tryingToSolve: ["Help with a crypto transaction"],
        monthlyRevenueBand: "$0–$5k / month",
        netWorthBand: "$0–$50k",
        timelineToAct: "ASAP / 0–3 months",
        budgetReadiness: "Maybe, if the fit is clear",
      })
    );

    expect(route.startHereFormRoute).toBe("Booked Call");
    expect(route.routingDecisionSignals).toContain(
      "Urgent low commercial signal"
    );
  });

  it("routes no-clear-path low commercial leads without budget readiness to unqualified", () => {
    const route = deriveStartHereRoute(
      makeValues({
        consideringSpecificStructure: "No — I want help finding the right path",
        tryingToSolve: ["Relocate my individual tax residency"],
        businessMainSourceOfIncome: true,
        monthlyRevenueBand: "$5k–$25k / month",
        netWorthBand: "$250k–$1M",
        timelineToAct: "3–6 months",
        budgetReadiness: "No",
      })
    );

    expect(route.startHereFormRoute).toBe("Unqualified / Not Ready");
  });

  it("routes high commercial but unclear answers to manual triage", () => {
    const route = deriveStartHereRoute(
      makeValues({
        consideringSpecificStructure: "No — I want help finding the right path",
        tryingToSolve: ["Relocate my individual tax residency"],
        monthlyRevenueBand: "$100k–$1M / month",
        netWorthBand: "$5M–$20M",
        timelineToAct: "3–6 months",
        budgetReadiness: "Maybe, if the fit is clear",
      })
    );

    expect(route.startHereFormRoute).toBe("Manual Triage");
  });

  it("uses routing output in prepared submissions", () => {
    const submission = prepareStartHereSubmission(
      makeValues({
        tryingToSolve: ["New bank account"],
        monthlyRevenueBand: "$25k–$100k / month",
      })
    );

    expect(submission.fields.startHereFormRoute).toBe("Booked Call");
    expect(submission.fields.bookedCallOwner).toBe("Will");
  });
});

function makeValues(
  overrides: Partial<StartHereFormValues> = {}
): StartHereFormValues {
  return {
    ...emptyStartHereFormValues,
    firstName: "Taylor",
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
