"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { warmCallMinimumSchedulingNoticeMetadataValue } from "@/lib/scheduling";
import type { StartHereSubmissionSuccessResponse } from "@/lib/start-here-submission";

type CalInlineConfig = {
  name: string;
  email: string;
  location: {
    value: "phone";
    optionValue: string;
  };
} & Record<`metadata[${string}]`, string>;

type CalEmbedOptions = {
  calLink: string;
  config: CalInlineConfig;
};

type CalApi = {
  (
    method: "init",
    config: {
      origin: "https://app.cal.com";
    }
  ): void;
  (
    method: "inline",
    config: {
      elementOrSelector: HTMLElement;
      calLink: string;
      config: CalInlineConfig;
    }
  ): void;
  (
    method: "on",
    config: {
      action: "bookingSuccessfulV2";
      callback: () => void;
    }
  ): void;
};

type QueuedCalApi = CalApi & {
  q?: CalInstruction[];
  loaded?: boolean;
  ns?: Record<string, unknown>;
};

type CalInstruction = [string, ...unknown[]] & {
  __redomiciledEmbedId?: string;
};

declare global {
  interface Window {
    Cal?: QueuedCalApi;
  }
}

export function CalInlineEmbed({
  submitted,
}: {
  submitted: StartHereSubmissionSuccessResponse;
}) {
  const embedOptions = useMemo(
    () => getCalEmbedOptions(submitted),
    [submitted]
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [embedFailed, setEmbedFailed] = useState(false);

  useEffect(() => {
    if (!embedOptions || !containerRef.current) {
      return;
    }

    let active = true;
    const container = containerRef.current;
    const embedId = globalThis.crypto.randomUUID();
    container.innerHTML = "";

    const Cal = getOrCreateCalEmbed(() => {
      if (active) {
        setEmbedFailed(true);
      }
    });

    callCal(Cal, embedId, "init", {
      origin: "https://app.cal.com",
    });
    callCal(Cal, embedId, "inline", {
      elementOrSelector: container,
      calLink: embedOptions.calLink,
      config: embedOptions.config,
    });
    callCal(Cal, embedId, "on", {
      action: "bookingSuccessfulV2",
      callback: () => {
        if (active) {
          setBookingCompleted(true);
        }
      },
    });

    return () => {
      active = false;
      removeQueuedCalInstructions(embedId);
      container.innerHTML = "";
    };
  }, [embedOptions]);

  if (!embedOptions) {
    return (
      <div
        role="region"
        aria-label="Booking calendar"
        className="grid min-h-[24rem] place-items-center rounded-2xl border border-white/15 bg-white/8 p-5 text-center"
      >
        <div className="max-w-sm space-y-3">
          <p className="text-sm font-semibold text-white">
            Cal.com calendar pending
          </p>
          <p className="text-sm leading-6 text-white/68">
            Calendar availability is being finalized. The live booking calendar
            will appear here once scheduling is connected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Booking calendar"
      className="w-full overflow-visible rounded-2xl border border-white/15 bg-white text-[#111]"
    >
      {embedFailed ? (
        <div className="grid min-h-[52rem] place-items-center p-5 text-center text-[#111] sm:min-h-[44rem]">
          <div className="max-w-sm space-y-3">
            <p className="text-sm font-semibold">Calendar unavailable</p>
            <p className="text-sm leading-6 text-black/65">
              Refresh the page to load the booking calendar again.
            </p>
          </div>
        </div>
      ) : null}
      {bookingCompleted ? (
        <p className="border-b border-black/10 bg-[#F6F6FF] px-4 py-3 text-center text-sm font-medium text-[#2422A1]">
          Booking received. We will send the details to Redomiciled.
        </p>
      ) : null}
      <div ref={containerRef} className="min-h-[52rem] w-full sm:min-h-[44rem]">
        <div className="grid h-full place-items-center p-5 text-center text-[#111]">
          <div className="max-w-sm space-y-3">
            <p className="text-sm font-semibold">Loading calendar...</p>
            <p className="text-sm leading-6 text-black/65">
              Availability should appear in a moment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function getCalEmbedOptions(
  submitted: StartHereSubmissionSuccessResponse
): CalEmbedOptions | null {
  const submission = submitted.submission;
  const calLink = getCalLink(submission.fields.calendarUrl);

  if (!calLink) {
    return null;
  }

  return {
    calLink,
    config: {
      name: `${submission.fields.firstName} ${submission.fields.lastName}`,
      email: submission.fields.email,
      location: {
        value: "phone",
        optionValue: submission.fields.phone,
      },
      ...toCalMetadataConfig({
        source: "start-here-form",
        startHereSubmissionId: submitted.persistence.submissionId,
        clickUpTaskId: submitted.persistence.taskId ?? "",
        startHereFormRoute: submission.fields.startHereFormRoute,
        bookedCallOwner: submission.fields.bookedCallOwner,
        leadSourceDetail: submission.fields.leadSourceDetail,
        minimumSchedulingNotice: warmCallMinimumSchedulingNoticeMetadataValue,
      }),
    },
  };
}

function getCalLink(calendarUrl: string) {
  if (!calendarUrl || calendarUrl.startsWith("PLACEHOLDER_")) {
    return null;
  }

  try {
    const url = new URL(calendarUrl);

    if (url.hostname === "cal.com" || url.hostname === "app.cal.com") {
      return url.pathname.replace(/^\/|\/$/g, "");
    }
  } catch {
    return calendarUrl.replace(/^\//, "").replace(/\/$/, "");
  }

  return null;
}

function removeEmptyValues(values: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(values).filter((entry): entry is [string, string] =>
      Boolean(entry[1])
    )
  );
}

function toCalMetadataConfig(values: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(removeEmptyValues(values)).map(([key, value]) => [
      `metadata[${key}]`,
      value,
    ])
  ) as Record<`metadata[${string}]`, string>;
}

function callCal(
  Cal: QueuedCalApi,
  embedId: string,
  method: CalInstruction[0],
  config: unknown
) {
  if (Cal.loaded) {
    Cal(method as "init", config as never);
    return;
  }

  const instruction = [method, config] as CalInstruction;
  instruction.__redomiciledEmbedId = embedId;
  Cal.q = Cal.q ?? [];
  Cal.q.push(instruction);
}

function removeQueuedCalInstructions(embedId: string) {
  const Cal = window.Cal;
  const queue = Cal?.q;

  if (!queue) {
    return;
  }

  Cal.q = queue.filter(
    (instruction) => instruction.__redomiciledEmbedId !== embedId
  );
}

function getOrCreateCalEmbed(onError: () => void) {
  if (typeof window === "undefined") {
    throw new Error("Cal.com embed is browser-only.");
  }

  if (window.Cal) {
    return window.Cal;
  }

  const Cal = ((...args: CalInstruction) => {
    Cal.q = Cal.q ?? [];
    Cal.q.push(args);
  }) as QueuedCalApi;

  Cal.q = [];
  Cal.ns = {};
  window.Cal = Cal;

  const existingScript = document.querySelector<HTMLScriptElement>(
    'script[src="https://app.cal.com/embed/embed.js"]'
  );

  if (existingScript) {
    existingScript.addEventListener("error", onError);
    return Cal;
  }

  const script = document.createElement("script");
  script.src = "https://app.cal.com/embed/embed.js";
  script.async = true;
  script.onerror = onError;
  document.head.append(script);

  return Cal;
}
