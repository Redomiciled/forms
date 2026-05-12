import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("renders the Start Here intake shell", () => {
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
  });

  it("keeps the user on a step and shows errors when required answers are missing", async () => {
    const user = userEvent.setup();

    render(<Home />);

    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByRole("heading", {
        name: /how can redomiciled reach you/i,
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

    render(<Home />);

    await user.type(screen.getByLabelText(/first name/i), "Taylor");
    await user.type(screen.getByLabelText(/last name/i), "Rivera");
    await user.type(screen.getByLabelText(/email/i), "taylor@example.com");
    await user.type(screen.getByLabelText(/^phone$/i), "+1 555 0100");
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
      screen.getByLabelText(/currently a resident/i),
      "Argentina"
    );
    await user.type(
      screen.getByLabelText(/passport\(s\) \/ citizenship\(s\)/i),
      "United States"
    );
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

    await user.click(
      screen.getByRole("button", { name: /prepare submission/i })
    );

    expect(
      screen.getByRole("heading", {
        name: /intake is ready for redomiciled review/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/PLACEHOLDER_CLICKUP_CRM_LIST_ID/)).toBeVisible();
  });
});
