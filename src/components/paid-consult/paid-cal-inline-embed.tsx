"use client";

import { useEffect, useRef, useState } from "react";

import type {
  PaidConsultCalEmbedOptions,
  PaidConsultCalInlineConfig,
} from "@/lib/paid-consult";

type PaidCalApi = {
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
      config: PaidConsultCalInlineConfig;
    }
  ): void;
  (
    method: "on",
    config: {
      action: "bookingSuccessfulV2";
      callback: (event: PaidCalEvent) => void;
    }
  ): void;
};

type PaidCalEvent = {
  detail?: {
    data?: unknown;
    namespace?: string;
    type?: string;
  };
};

type QueuedPaidCalApi = PaidCalApi & {
  loaded?: boolean;
  ns?: Record<string, unknown>;
  q?: PaidCalInstruction[];
};

type PaidCalInstruction = [string, ...unknown[]] & {
  __redomiciledEmbedId?: string;
};

type CalWindow = Window &
  typeof globalThis & {
    Cal?: QueuedPaidCalApi;
  };

export function PaidCalInlineEmbed({
  embedOptions,
  onBookingSubmitted,
}: {
  embedOptions: PaidConsultCalEmbedOptions | null;
  onBookingSubmitted: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
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
        if (!active) {
          return;
        }

        onBookingSubmitted();
      },
    });

    return () => {
      active = false;
      removeQueuedCalInstructions(embedId);
      container.innerHTML = "";
    };
  }, [embedOptions, onBookingSubmitted]);

  if (!embedOptions) {
    return (
      <div
        role="region"
        aria-label="Paid booking calendar"
        className="border-line bg-mist grid min-h-[24rem] flex-1 place-items-center rounded-2xl border p-5 text-center"
      >
        <div className="max-w-sm space-y-3">
          <p className="text-ink text-sm font-semibold">
            Booking calendar pending
          </p>
          <p className="text-stone text-sm leading-6">
            Redomiciled is finalizing paid consult availability.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Paid booking calendar"
      className="border-line bg-paper text-ink min-h-[28rem] flex-1 overflow-auto rounded-2xl border"
    >
      {embedFailed ? (
        <div className="text-ink grid h-full min-h-[28rem] place-items-center p-5 text-center">
          <div className="max-w-sm space-y-3">
            <p className="text-sm font-semibold">Calendar unavailable</p>
            <p className="text-stone text-sm leading-6">
              Refresh the page to load the booking calendar again.
            </p>
          </div>
        </div>
      ) : null}
      <div ref={containerRef} className="h-full min-h-[28rem] w-full">
        <div className="text-ink grid h-full place-items-center p-5 text-center">
          <div className="max-w-sm space-y-3">
            <p className="text-sm font-semibold">Loading calendar...</p>
            <p className="text-stone text-sm leading-6">
              Availability should appear in a moment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function callCal(
  Cal: QueuedPaidCalApi,
  embedId: string,
  method: PaidCalInstruction[0],
  config: unknown
) {
  if (Cal.loaded) {
    Cal(method as "init", config as never);
    return;
  }

  const instruction = [method, config] as PaidCalInstruction;
  instruction.__redomiciledEmbedId = embedId;
  Cal.q = Cal.q ?? [];
  Cal.q.push(instruction);
}

function removeQueuedCalInstructions(embedId: string) {
  const calWindow = window as CalWindow;
  const queue = calWindow.Cal?.q;

  if (!queue) {
    return;
  }

  calWindow.Cal!.q = queue.filter(
    (instruction) => instruction.__redomiciledEmbedId !== embedId
  );
}

function getOrCreateCalEmbed(onError: () => void) {
  const calWindow = window as CalWindow;

  if (calWindow.Cal) {
    return calWindow.Cal;
  }

  const Cal = ((...args: PaidCalInstruction) => {
    Cal.q = Cal.q ?? [];
    Cal.q.push(args);
  }) as QueuedPaidCalApi;

  Cal.q = [];
  Cal.ns = {};
  calWindow.Cal = Cal;

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
