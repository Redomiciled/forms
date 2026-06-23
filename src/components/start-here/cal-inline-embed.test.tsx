import { describe, expect, it } from "vitest";

import { prepareStartHereSubmission } from "@/lib/start-here";
import type { StartHereSubmissionSuccessResponse } from "@/lib/start-here-submission";

import { getCalEmbedOptions } from "./cal-inline-embed";

describe("getCalEmbedOptions", () => {
  it("builds the Will Cal.com inline embed config with reconciliation metadata", () => {
    const result = makeSubmittedResult();

    expect(getCalEmbedOptions(result)).toMatchObject({
      calLink: "william-denton-redomiciled/meeting-with-william",
      config: {
        name: "Taylor Rivera",
        email: "taylor@example.com",
        location: {
          value: "phone",
          optionValue: "+54 11 1234 5678",
        },
        "metadata[source]": "start-here-form",
        "metadata[startHereSubmissionId]": "submission-123",
        "metadata[clickUpTaskId]": "task-456",
        "metadata[startHereFormRoute]": "Booked Call",
        "metadata[bookedCallOwner]": "Will",
        "metadata[leadSourceDetail]": "Other",
        "metadata[minimumSchedulingNotice]": "1-day",
      },
    });
  });

  it("builds the Erik Cal.com inline embed config for non-banking booked calls", () => {
    const result = makeSubmittedResult({
      submission: prepareStartHereSubmission({
        firstName: "Taylor",
        lastName: "Rivera",
        email: "taylor@example.com",
        phone: "+54 11 1234 5678",
        leadSourceDetail: "Other",
        referralDetail: "",
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
        importantRoutingNotes: "",
      }),
    });

    expect(getCalEmbedOptions(result)).toMatchObject({
      calLink: "eric-redomiciled/30min",
      config: {
        "metadata[bookedCallOwner]": "Erik",
      },
    });
  });

  it("omits an empty ClickUp task ID", () => {
    const result = makeSubmittedResult({
      persistence: {
        submissionId: "submission-123",
        mode: "live",
        action: "created",
      },
    });

    expect(getCalEmbedOptions(result)?.config).not.toHaveProperty(
      "metadata[clickUpTaskId]"
    );
  });
});

function makeSubmittedResult(
  overrides: Partial<StartHereSubmissionSuccessResponse> = {}
): StartHereSubmissionSuccessResponse {
  return {
    ok: true,
    submission: prepareStartHereSubmission({
      firstName: "Taylor",
      lastName: "Rivera",
      email: "taylor@example.com",
      phone: "+54 11 1234 5678",
      leadSourceDetail: "Other",
      referralDetail: "",
      consideringSpecificStructure:
        "Yes — I know what structure I want, or I know I need a bank account",
      tryingToSolve: ["New bank account"],
      setupMaturity:
        "Partially set up — I have some international structure but want to improve it",
      currentResidence: "Argentina",
      passportsCitizenships: "United States",
      businessMainSourceOfIncome: true,
      monthlyRevenueBand: "$25k–$100k / month",
      netWorthBand: "$1M–$5M",
      timelineToAct: "ASAP / 0–3 months",
      budgetReadiness: "Maybe, if the fit is clear",
      importantRoutingNotes: "",
    }),
    persistence: {
      submissionId: "submission-123",
      mode: "live",
      action: "created",
      taskId: "task-456",
    },
    ...overrides,
  };
}
