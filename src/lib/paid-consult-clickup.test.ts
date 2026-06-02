import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getPaidConsultOwnerFromClickUpTask } from "./paid-consult-clickup";
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
});
