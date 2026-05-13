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
  scrollAreaClientHeight: number | null;
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

  const snapshot = await page.evaluate<MobileLayoutSnapshot>(() => {
    const stepList = document.querySelector("ol");
    const adminButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Admin"
    );
    const scrollArea = document.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
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
      scrollAreaClientHeight: scrollArea?.clientHeight ?? null,
      scrollAreaScrollHeight: scrollArea?.scrollHeight ?? null,
      stepListDisplay: stepList ? getComputedStyle(stepList).display : null,
      title: document.querySelector("h2")?.textContent?.trim() ?? null,
    };
  });

  console.log(JSON.stringify(snapshot, null, 2));

  assert(snapshot.title === "Contact", "Expected Step 1 title to be Contact.");
  assert(
    snapshot.stepListDisplay === "none",
    "Expected the step navigation list to be hidden on mobile."
  );
  assert(
    snapshot.adminButtonText === "Admin" && snapshot.adminButtonVisible,
    "Expected a visible mobile Admin button."
  );
  assert(
    snapshot.bodyOverflowY === "hidden",
    "Expected mobile body vertical overflow to be hidden."
  );
  assert(
    snapshot.documentScrollHeight <= snapshot.documentClientHeight,
    "Expected no document-level vertical scroll on mobile."
  );
  assert(
    snapshot.bodyScrollHeight <= snapshot.bodyClientHeight,
    "Expected no body-level vertical scroll on mobile."
  );
  assert(
    snapshot.scrollAreaClientHeight !== null &&
      snapshot.scrollAreaScrollHeight !== null,
    "Expected the step card scroll area to exist."
  );
} finally {
  await browser.close();
}
