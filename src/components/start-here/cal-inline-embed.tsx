"use client";

import { useMemo } from "react";

import type { StartHerePreparedSubmission } from "@/lib/start-here";

export function CalInlineEmbed({
  submitted,
}: {
  submitted: StartHerePreparedSubmission;
}) {
  const bookingUrl = useMemo(() => getCalBookingUrl(submitted), [submitted]);

  if (!bookingUrl) {
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
    <iframe
      title="Book a call"
      src={bookingUrl}
      className="h-[34rem] w-full rounded-2xl border border-white/15 bg-white text-[#111] lg:h-[min(46rem,calc(100dvh-9rem))]"
      loading="lazy"
    />
  );
}

function getCalBookingUrl(submitted: StartHerePreparedSubmission) {
  const baseUrl = getCalBaseUrl(submitted.fields.calendarUrl);

  if (!baseUrl) {
    return null;
  }

  baseUrl.searchParams.set(
    "name",
    `${submitted.fields.firstName} ${submitted.fields.lastName}`
  );
  baseUrl.searchParams.set("email", submitted.fields.email);
  baseUrl.searchParams.set(
    "location",
    JSON.stringify({
      value: "phone",
      optionValue: submitted.fields.phone,
    })
  );
  baseUrl.searchParams.set(
    "metadata[startHereFormRoute]",
    submitted.fields.startHereFormRoute
  );
  baseUrl.searchParams.set(
    "metadata[bookedCallOwner]",
    submitted.fields.bookedCallOwner
  );
  baseUrl.searchParams.set(
    "metadata[leadSourceDetail]",
    submitted.fields.leadSourceDetail
  );

  return baseUrl.toString();
}

function getCalBaseUrl(calendarUrl: string) {
  if (!calendarUrl || calendarUrl.startsWith("PLACEHOLDER_")) {
    return null;
  }

  try {
    const url = new URL(calendarUrl);

    if (url.hostname === "cal.com" || url.hostname === "app.cal.com") {
      url.hostname = "cal.com";
      url.search = "";
      url.hash = "";
      return url;
    }
  } catch {
    return new URL(
      `https://cal.com/${calendarUrl.replace(/^\//, "").replace(/\/$/, "")}`
    );
  }

  return null;
}
