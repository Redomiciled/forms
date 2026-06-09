import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prepareStartHereSubmission } from "@/lib/start-here";

import Home from "./page";

describe("Home", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
        const body =
          typeof init?.body === "string" ? JSON.parse(init.body) : null;

        return Response.json({
          ok: true,
          submission: prepareStartHereSubmission(body.values),
          persistence: {
            submissionId: "test-submission-id",
            mode: "live",
            action: "created",
            taskId: "test-task-id",
          },
        });
      })
    );
  });

  it("renders the Start Here intake shell", () => {
    window.history.pushState({}, "", "/");
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /begin your global journey/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /continue/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /choose view/i })
    ).not.toBeInTheDocument();
  });

  it("keeps the user on a step and shows errors when required answers are missing", async () => {
    const user = userEvent.setup();

    window.history.pushState({}, "", "/");
    render(<Home />);

    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByRole("heading", {
        name: /contact/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/please complete the highlighted fields/i)
    ).toBeVisible();
    expect(screen.getByText(/first name is required/i)).toBeVisible();
    expect(screen.getByLabelText(/first name/i)).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(
      screen.getByRole("button", { name: /commercial readiness/i })
    ).toBeDisabled();
  });

  it("prepares a local submission payload", async () => {
    const user = userEvent.setup();

    window.history.pushState({}, "", "/");
    render(<Home />);

    await user.type(screen.getByLabelText(/first name/i), "Taylor");
    await user.type(screen.getByLabelText(/last name/i), "Rivera");
    await user.type(screen.getByLabelText(/email/i), "taylor@example.com");
    await user.clear(screen.getByLabelText(/country calling code/i));
    await user.type(screen.getByLabelText(/country calling code/i), "+54");
    await user.type(screen.getByLabelText(/phone number/i), "11 1234 5678");
    expect(screen.queryByText(/where are you coming from/i)).toBeNull();
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByRole("button", { name: /contact info/i })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: /commercial readiness/i })
    ).toBeDisabled();

    await user.click(
      screen.getByRole("radio", {
        name: /yes .* structure .* bank account/i,
      })
    );
    await user.click(
      screen.getByRole("checkbox", { name: /new bank account/i })
    );
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await user.click(screen.getByRole("radio", { name: /partially set up/i }));
    await user.type(
      screen.getByLabelText(/currently a resident.*search/i),
      "Arg"
    );
    await user.click(screen.getByRole("button", { name: /Argentina/i }));
    expect(
      screen.queryByRole("button", { name: /United States/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /add a new country/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/start typing to find a country/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /United States/i })).toBeNull();
    await user.type(
      screen.getByLabelText(/passport.*citizenship.*search/i),
      "United"
    );
    await user.click(screen.getByRole("button", { name: /United States/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    const businessIncomeYes = screen.getAllByRole("radio", {
      name: "Yes",
    })[0];

    if (!businessIncomeYes) {
      throw new Error("Business income yes button was not rendered.");
    }

    await user.click(businessIncomeYes);
    await user.click(
      screen.getByRole("radio", { name: /\$25k.*\$100k.*month/i })
    );
    await user.click(screen.getByRole("radio", { name: /\$1M.*\$5M/i }));
    await user.click(
      screen.getByRole("radio", { name: /ASAP \/ 0.*3 months/i })
    );
    await user.click(
      screen.getByRole("radio", {
        name: /maybe, if the fit is clear/i,
      })
    );
    await user.click(screen.getByRole("button", { name: /complete/i }));

    expect(
      screen.getByRole("dialog", { name: /confirm the intake/i })
    ).toBeVisible();
    expect(screen.getByText("Phone").closest("div")).toHaveTextContent(
      /\+54 11 ?1234 ?5678/
    );

    await user.click(
      screen.getByRole("button", { name: /confirm and continue/i })
    );

    expect(screen.getByTitle(/banking path video/i)).toHaveAttribute(
      "src",
      "https://drive.google.com/file/d/1rYeAgJjCDyQjogm8ynmVLX1mBRm53lmc/preview"
    );
    expect(
      screen.getByRole("region", { name: /pre-booking video/i })
    ).toBeVisible();
    expect(
      screen.queryByRole("region", { name: /booking calendar/i })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /book a meeting/i }));

    expect(
      screen.getByRole("heading", { name: /book a call with us/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /booking calendar/i })
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /edit answers/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/choose a time with/i)).toBeNull();
    expect(screen.queryByText(/PLACEHOLDER_CLICKUP_CRM_LIST_ID/)).toBeNull();
  });

  it("uses admin preview presets to show route outcomes", async () => {
    const user = userEvent.setup();

    window.history.pushState({}, "", "/?admin=1");
    render(<Home />);

    await user.click(
      await screen.findByRole("button", { name: /choose view/i })
    );
    expect(
      screen.getByRole("dialog", { name: /admin preview/i })
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: /unqualified/i }));
    await user.click(screen.getByRole("button", { name: /complete/i }));
    await user.click(
      screen.getByRole("button", { name: /confirm and continue/i })
    );

    expect(
      screen.getByRole("heading", {
        name: /we’ve received your start here answers/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/free redomiciled community for more details/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ready to invest at least €1,500/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /visit free community/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /review answers/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Redomiciled")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /submission received/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Unqualified / Not Ready")).toBeNull();
    expect(screen.queryByText("Route")).toBeNull();
    expect(screen.queryByText("Owner")).toBeNull();
    expect(screen.queryByText("Timeline")).toBeNull();
    expect(
      screen.queryByText("No calendar is shown for this route.")
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: /review answers/i }));
    expect(
      screen.getByRole("dialog", { name: /confirm the intake/i })
    ).toBeVisible();
    expect(
      screen.getByText("Budget readiness").closest("div")
    ).toHaveTextContent(/no/i);

    await user.click(
      screen.getByRole("button", { name: /confirm and continue/i })
    );
    expect(
      screen.getByRole("heading", {
        name: /we’ve received your start here answers/i,
      })
    ).toBeInTheDocument();

    const fetchMock = vi.mocked(fetch);
    const latestRequestBody = JSON.parse(
      String(fetchMock.mock.calls.at(-1)?.[1]?.body)
    ) as { taskId?: string };

    expect(latestRequestBody.taskId).toBe("test-task-id");
  });

  it("does not submit the admin form when pressing Enter in country fields", async () => {
    const user = userEvent.setup();

    window.history.pushState({}, "", "/?admin=1");
    render(<Home />);

    await user.click(
      await screen.findByRole("button", { name: /choose view/i })
    );
    await user.click(
      screen.getByRole("button", { name: /booked call - banking/i })
    );
    await user.click(
      screen.getByRole("button", { name: /step 3.*where are you starting/i })
    );

    const residenceSearch = screen.getByLabelText(
      /currently a resident.*search/i
    );

    await user.type(residenceSearch, "Argentina{enter}");

    expect(
      screen.getByRole("heading", { name: /where are you starting from/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /book a call with us/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: /confirm the intake/i })
    ).toBeNull();
  });
});
