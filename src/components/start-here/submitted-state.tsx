import { CalendarCheck, Check, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { StartHerePreparedSubmission } from "@/lib/start-here";

import { CalInlineEmbed } from "./cal-inline-embed";
import { Metric } from "./fields";

export function SubmittedState({
  submitted,
  onEdit,
}: {
  submitted: StartHerePreparedSubmission;
  onEdit: () => void;
}) {
  const route = submitted.fields.startHereFormRoute;
  const isBookedCall = route === "Booked Call";
  const isUnqualified = route === "Unqualified / Not Ready";
  const badge = isBookedCall
    ? "Booked call"
    : isUnqualified
      ? "Best next step"
      : "Manual triage";
  const title = isBookedCall
    ? "Your Start Here intake is ready to book."
    : isUnqualified
      ? "Keep using the free Redomiciled community for now."
      : "Your Start Here intake is ready for Redomiciled review.";
  const description = isBookedCall
    ? "Based on your answers, the next step is a call with the right Redomiciled owner."
    : isUnqualified
      ? "Based on your answers, the best next step is to keep using the free Redomiciled community for now. If your situation changes, or if you’re ready to invest at least €1,500 in professional support, you can submit again and we’ll route you to the right next step."
      : "Your answers indicate possible value, but the right route needs internal review before a calendar is shown.";

  return (
    <section className="mx-auto flex h-dvh w-full max-w-7xl flex-col overflow-hidden px-5 py-4 text-white sm:px-8 sm:py-6 lg:px-10">
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-6">
        <div className="min-h-0 overflow-auto pr-1">
          <div className="space-y-4 lg:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/80 shadow-[0_0_24px_rgba(92,89,255,0.26)] backdrop-blur">
              <Check className="size-4" />
              {badge}
            </div>
            <div className="space-y-3 lg:space-y-4">
              <h1 className="max-w-2xl text-3xl leading-tight font-semibold sm:text-4xl lg:text-6xl">
                {title}
              </h1>
              <p className="max-w-xl text-sm leading-6 text-white/75 sm:text-base lg:text-lg lg:leading-7">
                {description}
              </p>
            </div>
            <div className="grid gap-3 text-sm text-white/75 sm:grid-cols-3">
              <Metric
                label="Route"
                value={submitted.fields.startHereFormRoute}
              />
              <Metric label="Owner" value={submitted.fields.bookedCallOwner} />
              <Metric label="Timeline" value={submitted.fields.timelineToAct} />
            </div>
            {isUnqualified ? (
              <div className="rounded-2xl border border-white/15 bg-white/8 p-4 text-sm text-white/75">
                No calendar is shown for this route.
              </div>
            ) : null}
            {!isBookedCall && !isUnqualified ? (
              <div className="rounded-2xl border border-white/15 bg-white/8 p-4 text-sm text-white/75">
                Redomiciled will review this intake and follow up with the right
                next step.
              </div>
            ) : null}
            <div className="grid gap-3 text-sm text-white/75 sm:grid-cols-2">
              <Metric
                label="Name"
                value={`${submitted.fields.firstName} ${submitted.fields.lastName}`}
              />
              <Metric label="Email" value={submitted.fields.email} />
              <Metric label="Phone" value={submitted.fields.phone} />
              <Metric label="Net worth" value={submitted.fields.netWorthBand} />
            </div>
            <Button
              type="button"
              className="h-11 rounded-xl bg-white px-5 text-sm font-semibold text-[#2422A1] hover:bg-white/90"
              onClick={onEdit}
            >
              Edit answers
            </Button>
          </div>
        </div>
        <div className="min-h-0 overflow-hidden rounded-3xl border border-white/15 bg-black/18 p-4 shadow-2xl backdrop-blur-xl">
          {isBookedCall ? (
            <div className="grid h-full min-h-0 gap-4">
              <div className="flex items-start gap-3">
                <CalendarCheck className="mt-1 size-5 shrink-0 text-[#A3A1FF]" />
                <div>
                  <h2 className="text-lg font-semibold">Book your call</h2>
                  <p className="mt-1 text-sm leading-6 text-white/65">
                    Choose a time with {submitted.fields.bookedCallOwner}. Your
                    contact details are passed into Cal.com so the booking form
                    can be prefilled.
                  </p>
                </div>
              </div>
              <CalInlineEmbed submitted={submitted} />
            </div>
          ) : (
            <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-white/8 p-6 text-center">
              <div className="max-w-md space-y-4">
                <ClipboardCheck className="mx-auto size-9 text-[#A3A1FF]" />
                <h2 className="text-2xl font-semibold">Submission received</h2>
                <p className="text-sm leading-6 text-white/70">
                  No calendar is shown for this route. The next step is handled
                  by Redomiciled based on the outcome shown here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
