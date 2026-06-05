import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PaidConsultFlow } from "./paid-consult-flow";

type CalCallback = (event: unknown) => void;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

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

  it("unlocks the paid booking calendar when Tally sends a stringified submit event", async () => {
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

    window.dispatchEvent(
      new MessageEvent("message", {
        data: JSON.stringify({
          event: "Tally.FormSubmitted",
          payload: { formId: "msa123" },
        }),
        origin: "https://tally.so",
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: /paid booking calendar/i })
      ).toBeInTheDocument();
    });
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

  it("shows the final view only after ClickUp confirms the paid booking", async () => {
    const calCallbacks = new Map<string, CalCallback>();
    const cal = Object.assign(
      vi.fn((method: string, config: unknown) => {
        if (method === "on") {
          const eventConfig = config as {
            action: string;
            callback: CalCallback;
          };
          calCallbacks.set(eventConfig.action, eventConfig.callback);
        }
      }),
      { loaded: true }
    );
    let statusCalls = 0;
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      if (String(url).startsWith("/api/paid-consult/status")) {
        statusCalls += 1;
        return Response.json({ completed: statusCalls > 1 });
      }

      return Response.json({ ok: true });
    });

    vi.stubGlobal("Cal", cal);
    vi.stubGlobal("fetch", fetchMock);

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
    await waitFor(() => {
      expect(calCallbacks.has("bookingSuccessfulV2")).toBe(true);
    });
    expect(
      screen.queryByRole("region", { name: /booking confirmation/i })
    ).not.toBeInTheDocument();

    await act(async () => {
      calCallbacks.get("bookingSuccessfulV2")?.({
        detail: {
          data: {
            paymentRequired: true,
            status: "PENDING",
          },
        },
      });
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/paid-consult/status?id=CU-123",
        { cache: "no-store" }
      );
    });
    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: /booking confirmation/i })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Redomiciled will send the next form/i)
    ).toBeInTheDocument();
  });
});
