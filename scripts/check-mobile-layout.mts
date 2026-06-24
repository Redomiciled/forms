import { chromium } from "@playwright/test";

type MobileLayoutSnapshot = {
  adminButtonText: string | null;
  adminButtonVisible: boolean;
  bodyClientHeight: number;
  bodyOverflowY: string;
  bodyScrollHeight: number;
  documentClientHeight: number;
  documentOverflowY: string;
  documentScrollHeight: number;
  heroHeadingDisplay: string | null;
  mobileErrorVisibleAfterContinue: boolean;
  undersizedTextControls: string[];
  scrollAreaClientHeight: number | null;
  scrollAreaDisplay: string | null;
  scrollAreaScrollHeight: number | null;
  stepEyebrowText: string | null;
  stepListDisplay: string | null;
  title: string | null;
};

const url = process.argv[2] ?? "http://127.0.0.1:3000/?admin=1";
const viewport = { width: 390, height: 844 };

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ isMobile: true, viewport });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Continue" }).click();

  const snapshot = await page.evaluate<MobileLayoutSnapshot>(() => {
    const stepList = document.querySelector("ol");
    const adminButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Admin"
    );
    const scrollArea = document.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    );
    const stepEyebrow = Array.from(document.querySelectorAll("p span")).find(
      (span) =>
        span.textContent?.trim() === "Step 1 of 4" &&
        getComputedStyle(span).display !== "none"
    );
    const heroHeading = Array.from(document.querySelectorAll("h1")).find(
      (heading) => heading.textContent?.trim() === "Begin your global journey."
    );
    const mobileError = Array.from(document.querySelectorAll("p")).find(
      (paragraph) =>
        paragraph.textContent?.trim() ===
          "Please complete the highlighted fields before continuing." &&
        getComputedStyle(paragraph).display !== "none"
    );
    const undersizedTextControls = Array.from(
      document.querySelectorAll<HTMLElement>("input, textarea")
    )
      .filter((control) => {
        const rect = control.getBoundingClientRect();

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          Number.parseFloat(getComputedStyle(control).fontSize) < 16
        );
      })
      .map((control) => control.getAttribute("aria-label") ?? control.id);

    return {
      adminButtonText: adminButton?.textContent?.trim() ?? null,
      adminButtonVisible: adminButton
        ? getComputedStyle(adminButton).display !== "none" &&
          adminButton.getBoundingClientRect().width > 0 &&
          adminButton.getBoundingClientRect().height > 0
        : false,
      bodyClientHeight: document.body.clientHeight,
      bodyOverflowY: getComputedStyle(document.body).overflowY,
      bodyScrollHeight: document.body.scrollHeight,
      documentClientHeight: document.documentElement.clientHeight,
      documentOverflowY: getComputedStyle(document.documentElement).overflowY,
      documentScrollHeight: document.documentElement.scrollHeight,
      heroHeadingDisplay: heroHeading
        ? getComputedStyle(heroHeading).display
        : null,
      mobileErrorVisibleAfterContinue: Boolean(mobileError),
      scrollAreaClientHeight: scrollArea?.clientHeight ?? null,
      scrollAreaDisplay: scrollArea
        ? getComputedStyle(scrollArea).display
        : null,
      scrollAreaScrollHeight: scrollArea?.scrollHeight ?? null,
      stepEyebrowText: stepEyebrow?.textContent?.trim() ?? null,
      stepListDisplay: stepList ? getComputedStyle(stepList).display : null,
      title: document.querySelector("h2")?.textContent?.trim() ?? null,
      undersizedTextControls,
    };
  });

  console.log(JSON.stringify(snapshot, null, 2));

  assert(snapshot.title === "Contact", "Expected Step 1 title to be Contact.");
  assert(
    snapshot.stepListDisplay === "none",
    "Expected the step navigation card list to be hidden on mobile."
  );
  assert(
    snapshot.stepEyebrowText === "Step 1 of 4",
    "Expected the mobile form header to show progress as 'Step 1 of 4'."
  );
  assert(
    snapshot.adminButtonText === "Admin" && snapshot.adminButtonVisible,
    "Expected a visible mobile Admin button."
  );
  assert(
    snapshot.heroHeadingDisplay !== "none",
    "Expected the hero heading to be visible on mobile."
  );
  assert(
    snapshot.bodyOverflowY !== "hidden",
    "Expected mobile body vertical overflow to use native page scrolling."
  );
  assert(
    snapshot.scrollAreaClientHeight !== null &&
      snapshot.scrollAreaScrollHeight !== null &&
      snapshot.scrollAreaScrollHeight <= snapshot.scrollAreaClientHeight,
    "Expected the step-card area to expand instead of scrolling independently on mobile."
  );
  assert(
    snapshot.mobileErrorVisibleAfterContinue,
    "Expected the validation warning to appear near the mobile action buttons."
  );
  assert(
    snapshot.undersizedTextControls.length === 0,
    `Expected mobile text controls to use at least 16px font size: ${snapshot.undersizedTextControls.join(", ")}`
  );
} finally {
  await browser.close();
}
