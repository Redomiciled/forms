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
  scrollAreaClientHeight: number | null;
  scrollAreaDisplay: string | null;
  scrollAreaScrollHeight: number | null;
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
    const heroHeading = Array.from(document.querySelectorAll("h1")).find(
      (heading) => heading.textContent?.trim() === "Begin your global journey."
    );
    const mobileError = Array.from(document.querySelectorAll("p")).find(
      (paragraph) =>
        paragraph.textContent?.trim() ===
          "Please complete the highlighted fields before continuing." &&
        getComputedStyle(paragraph).display !== "none"
    );

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
      stepListDisplay: stepList ? getComputedStyle(stepList).display : null,
      title: document.querySelector("h2")?.textContent?.trim() ?? null,
    };
  });

  console.log(JSON.stringify(snapshot, null, 2));

  assert(snapshot.title === "Contact", "Expected Step 1 title to be Contact.");
  assert(
    snapshot.stepListDisplay === "grid",
    "Expected the step navigation list to be visible on mobile."
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
} finally {
  await browser.close();
}
