"use client";

import { useEffect, useId, useMemo } from "react";

import type { StartHerePreparedSubmission } from "@/lib/start-here";

type CalCommand = [string] | [string, Record<string, unknown>];

type CalApi = {
  (action: string, config?: Record<string, unknown>): void;
  loaded?: boolean;
  q?: CalCommand[];
  config?: {
    forwardQueryParams?: boolean;
  };
};

declare global {
  interface Window {
    Cal?: CalApi;
  }
}

const CAL_EMBED_SCRIPT_ID = "cal-embed-script";

export function CalInlineEmbed({
  submitted,
}: {
  submitted: StartHerePreparedSubmission;
}) {
  const embedId = useId().replace(/:/g, "");
  const calLink = getCalLinkFromUrl(submitted.fields.calendarUrl);
  const fullName = `${submitted.fields.firstName} ${submitted.fields.lastName}`;
  const config = useMemo(
    () => ({
      name: fullName,
      email: submitted.fields.email,
      location: JSON.stringify({
        value: "phone",
        optionValue: submitted.fields.phone,
      }),
      "metadata[startHereFormRoute]": submitted.fields.startHereFormRoute,
      "metadata[bookedCallOwner]": submitted.fields.bookedCallOwner,
      "metadata[leadSourceDetail]": submitted.fields.leadSourceDetail,
    }),
    [fullName, submitted.fields]
  );

  useEffect(() => {
    if (!calLink) {
      return;
    }

    const cal = ensureCalEmbed();
    cal.config = { ...cal.config, forwardQueryParams: true };
    cal("init", { origin: "https://cal.com" });
    cal("ui", {
      hideEventTypeDetails: false,
      styles: {
        body: { background: "transparent" },
        eventTypeListItem: { background: "transparent" },
      },
    });
    cal("inline", {
      elementOrSelector: `#${embedId}`,
      calLink,
      config,
    });
  }, [calLink, config, embedId]);

  if (!calLink) {
    return (
      <div className="grid min-h-[24rem] place-items-center rounded-2xl border border-white/15 bg-white/8 p-5 text-center">
        <div className="max-w-sm space-y-3">
          <p className="text-sm font-semibold text-white">
            Cal.com calendar pending
          </p>
          <p className="text-sm leading-6 text-white/68">
            Add the real Cal.com event link for{" "}
            {submitted.fields.bookedCallOwner} to render the live booking
            calendar here.
          </p>
          <p className="rounded-xl border border-white/10 bg-black/18 p-3 text-xs break-all text-white/58">
            {submitted.fields.calendarUrl}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id={embedId}
      className="min-h-[32rem] overflow-hidden rounded-2xl border border-white/15 bg-white text-[#111]"
    />
  );
}

function ensureCalEmbed() {
  if (window.Cal) {
    return window.Cal;
  }

  const cal = ((action: string, config?: Record<string, unknown>) => {
    cal.q = cal.q ?? [];
    cal.q.push(config ? [action, config] : [action]);
  }) as CalApi;

  cal.q = [];
  window.Cal = cal;

  if (!document.getElementById(CAL_EMBED_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = CAL_EMBED_SCRIPT_ID;
    script.async = true;
    script.src = "https://app.cal.com/embed/embed.js";
    document.head.appendChild(script);
  }

  return cal;
}

function getCalLinkFromUrl(calendarUrl: string) {
  if (!calendarUrl || calendarUrl.startsWith("PLACEHOLDER_")) {
    return null;
  }

  try {
    const url = new URL(calendarUrl);

    if (url.hostname === "cal.com" || url.hostname === "app.cal.com") {
      return url.pathname.replace(/^\//, "");
    }
  } catch {
    return calendarUrl;
  }

  return null;
}
