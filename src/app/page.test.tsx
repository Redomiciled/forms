import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("renders the initial Redomiciled scaffold", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /start here/i,
      })
    ).toBeInTheDocument();
  });
});
