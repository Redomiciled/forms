import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getPaidConsultCompletionFromClickUpTask,
  getPaidConsultContextFromClickUpTask,
  getPaidConsultOwnerFromClickUpTask,
} from "./paid-consult-clickup";
import {
  paidConsultBookedCallOwnerFieldId,
  paidConsultOwnerUserIds,
} from "./paid-consult";

const envSnapshot = { ...process.env };

beforeEach(() => {
  process.env = { ...envSnapshot };
  process.env["REDOMICILED_CLICKUP_API_TOKEN"] = "test-token";
});

afterEach(() => {
  vi.restoreAllMocks();
  process.env = { ...envSnapshot };
});

describe("paid consult ClickUp owner lookup", () => {
  it("fetches the task and resolves Erik from Booked Call Owner", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        custom_fields: [
          {
            id: paidConsultBookedCallOwnerFieldId,
            value: [{ id: paidConsultOwnerUserIds.Erik }],
          },
        ],
      })
    ) as unknown as typeof fetch;

    await expect(
      getPaidConsultOwnerFromClickUpTask("CU-123", { fetchImpl })
    ).resolves.toBe("Erik");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.clickup.com/api/v2/task/CU-123",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "test-token",
        }),
      })
    );
  });

  it("defaults to Will when ClickUp cannot read the task", async () => {
    const fetchImpl = vi.fn(
      async () => new Response("not found", { status: 404 })
    ) as unknown as typeof fetch;

    await expect(
      getPaidConsultOwnerFromClickUpTask("CU-404", { fetchImpl })
    ).resolves.toBe("Will");
  });

  it("returns safe name and email prefill from ClickUp custom fields", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        custom_fields: [
          { name: "First Name", value: "Juan Cruz" },
          { name: "Last Name", value: "Hernandez" },
          { name: "Email", value: "JUAN.H@PULPSENSE.COM" },
        ],
      })
    ) as unknown as typeof fetch;

    await expect(
      getPaidConsultContextFromClickUpTask("CU-123", { fetchImpl })
    ).resolves.toEqual({
      bookedCallOwner: "Will",
      prefill: {
        email: "juan.h@pulpsense.com",
        firstName: "Juan Cruz",
        lastName: "Hernandez",
        name: "Juan Cruz Hernandez",
      },
    });
  });

  it("reports the paid consult as complete only after ClickUp has the paid status fields", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        status: { status: "consult paid" },
        custom_fields: [
          { name: "Paid Consult Booking ID", value: "20529043" },
          {
            name: "Payment Status",
            value: "paid-option-id",
            type_config: {
              options: [{ id: "paid-option-id", name: "Paid" }],
            },
          },
          {
            name: "Meeting URL",
            value: "https://app.cal.com/video/eV7MX86odUSc4cp8sCTjSf",
          },
        ],
      })
    ) as unknown as typeof fetch;

    await expect(
      getPaidConsultCompletionFromClickUpTask("CU-123", { fetchImpl })
    ).resolves.toEqual({
      completed: true,
      meetingUrl: "https://app.cal.com/video/eV7MX86odUSc4cp8sCTjSf",
      paidConsultBookingId: "20529043",
      paymentStatus: "Paid",
      reason: "paid",
      status: "consult paid",
    });
  });

  it("keeps the paid consult pending when ClickUp has not confirmed payment", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        status: { status: "paid consult sent" },
        custom_fields: [
          { name: "Paid Consult Booking ID", value: "" },
          { name: "Payment Status", value: "" },
        ],
      })
    ) as unknown as typeof fetch;

    await expect(
      getPaidConsultCompletionFromClickUpTask("CU-123", { fetchImpl })
    ).resolves.toMatchObject({
      completed: false,
      reason: "pending",
      status: "paid consult sent",
    });
  });
});
