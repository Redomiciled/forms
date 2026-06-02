import { describe, expect, it, vi } from "vitest";

import {
  buildTallyMsaEmbedUrl,
  getPaidConsultConfig,
  getPaidConsultCalEmbedOptions,
  normalizeCalLink,
  paidConsultTallyFormId,
  parsePaidConsultPreviewState,
  parsePaidConsultTaskId,
} from "./paid-consult";

describe("paid consult route helpers", () => {
  it("parses valid ClickUp task identifiers from the id query param", () => {
    expect(parsePaidConsultTaskId("task_123-ABC")).toBe("task_123-ABC");
    expect(parsePaidConsultTaskId(["CU-123", "CU-456"])).toBe("CU-123");
  });

  it("rejects missing or unsafe task identifiers", () => {
    expect(parsePaidConsultTaskId(undefined)).toBeNull();
    expect(parsePaidConsultTaskId("")).toBeNull();
    expect(parsePaidConsultTaskId("x")).toBeNull();
    expect(parsePaidConsultTaskId("task id")).toBeNull();
    expect(parsePaidConsultTaskId("task/123")).toBeNull();
  });

  it("parses local preview steps", () => {
    expect(parsePaidConsultPreviewState("1")).toBe(1);
    expect(parsePaidConsultPreviewState(["2", "complete"])).toBe(2);
    expect(parsePaidConsultPreviewState("3")).toBe("complete");
    expect(parsePaidConsultPreviewState("complete")).toBe("complete");
    expect(parsePaidConsultPreviewState("4")).toBeNull();
    expect(parsePaidConsultPreviewState(undefined)).toBeNull();
  });

  it("builds the Tally embed URL with required hidden fields", () => {
    const url = new URL(
      buildTallyMsaEmbedUrl({
        formId: "abc123",
        taskId: "CU-123",
      })
    );

    expect(url.origin).toBe("https://tally.so");
    expect(url.pathname).toBe("/embed/abc123");
    expect(url.searchParams.get("id")).toBe("CU-123");
    expect(url.searchParams.get("source")).toBe("paid-consult");
    expect(url.searchParams.get("originPage")).toBe("/paid-consult");
    expect(url.searchParams.get("dynamicHeight")).toBe("1");
  });

  it("normalizes Cal.com links and rejects non-Cal URLs", () => {
    expect(normalizeCalLink("https://cal.com/redomiciled/paid")).toBe(
      "redomiciled/paid"
    );
    expect(normalizeCalLink("app.cal.com/redomiciled/paid")).toBe(
      "redomiciled/paid"
    );
    expect(normalizeCalLink("/redomiciled/paid/")).toBe("redomiciled/paid");
    expect(normalizeCalLink("https://example.com/redomiciled/paid")).toBe("");
    expect(normalizeCalLink("PLACEHOLDER_CAL_LINK")).toBe("");
  });

  it("uses Will's verified paid consult Cal.com link", () => {
    expect(getPaidConsultConfig().calLink).toBe(
      "william-denton-redomiciled/paid-consult"
    );
  });

  it("uses the MSA Tally form handled by the n8n MSA workflow", () => {
    vi.stubEnv("NEXT_PUBLIC_REDOMICILED_PAID_CONSULT_TALLY_FORM_ID", "");

    expect(paidConsultTallyFormId).toBe("PdOAkB");
    expect(getPaidConsultConfig().tallyFormId).toBe("PdOAkB");

    vi.unstubAllEnvs();
  });

  it("builds paid Cal.com metadata for webhook reconciliation", () => {
    expect(
      getPaidConsultCalEmbedOptions({
        calLink: "https://cal.com/redomiciled/paid",
        taskId: "CU-123",
      })
    ).toEqual({
      calLink: "redomiciled/paid",
      config: {
        "metadata[source]": "paid-consult",
        "metadata[clickUpTaskId]": "CU-123",
        "metadata[originPage]": "/paid-consult",
      },
    });
  });
});
