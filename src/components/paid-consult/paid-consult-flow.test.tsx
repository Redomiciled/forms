import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PaidConsultFlow } from "./paid-consult-flow";

describe("PaidConsultFlow", () => {
  it("renders a safe state when the private consult link is missing", () => {
    render(
      <PaidConsultFlow
        config={{
          bookedCallOwner: "Will",
          tallyFormId: "msa123",
          calLink: "redomiciled/paid",
        }}
        hasInvalidTaskId={false}
        taskId={null}
      />
    );

    expect(
      screen.getByRole("heading", { name: /this consult link is incomplete/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /service agreement/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /paid booking calendar/i })
    ).not.toBeInTheDocument();
  });

  it("renders a client-safe pending state when production embeds are not configured", () => {
    render(
      <PaidConsultFlow
        config={{ bookedCallOwner: "Will", tallyFormId: "", calLink: "" }}
        hasInvalidTaskId={false}
        taskId="CU-123"
      />
    );

    expect(
      screen.getByRole("heading", {
        name: /this consult page is being finalized/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/NEXT_PUBLIC_REDOMICILED/i)
    ).not.toBeInTheDocument();
  });

  it("unlocks the paid booking calendar after the Tally submit event", async () => {
    render(
      <PaidConsultFlow
        config={{
          bookedCallOwner: "Will",
          tallyFormId: "msa123",
          calLink: "redomiciled/paid",
        }}
        hasInvalidTaskId={false}
        taskId="CU-123"
      />
    );

    expect(
      screen.getByRole("region", { name: /service agreement/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /paid booking calendar/i })
    ).not.toBeInTheDocument();

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          event: "Tally.FormSubmitted",
          formId: "msa123",
        },
        origin: "https://tally.so",
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: /paid booking calendar/i })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { name: /book and pay for your consult/i })
    ).toBeInTheDocument();
  });

  it("can preview the paid booking step without a Tally submit event", () => {
    render(
      <PaidConsultFlow
        config={{
          bookedCallOwner: "Will",
          tallyFormId: "msa123",
          calLink: "redomiciled/paid",
        }}
        hasInvalidTaskId={false}
        previewState={2}
        taskId="CU-123"
      />
    );

    expect(
      screen.getByRole("region", { name: /paid booking calendar/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /service agreement/i })
    ).not.toBeInTheDocument();
  });

  it("can preview the booking confirmation view", () => {
    render(
      <PaidConsultFlow
        config={{
          bookedCallOwner: "Will",
          tallyFormId: "msa123",
          calLink: "redomiciled/paid",
        }}
        hasInvalidTaskId={false}
        previewState="complete"
        taskId="CU-123"
      />
    );

    expect(
      screen.getByRole("region", { name: /booking confirmation/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/booking received/i)).toBeInTheDocument();
  });
});
