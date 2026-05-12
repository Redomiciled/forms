import { ArrowUpRight, ClipboardCheck } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import type { StartHerePreparedSubmission } from "@/lib/start-here";

import { CalInlineEmbed } from "./cal-inline-embed";

export function SubmittedState({
  submitted,
}: {
  submitted: StartHerePreparedSubmission;
}) {
  const route = submitted.fields.startHereFormRoute;
  const isBookedCall = route === "Booked Call";
  const isUnqualified = route === "Unqualified / Not Ready";

  if (isBookedCall) {
    return (
      <section className="mx-auto flex h-dvh w-full max-w-7xl flex-col justify-center overflow-hidden px-4 py-3 text-white sm:px-6 lg:px-8">
        <div className="grid min-h-0 gap-3">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex w-fit items-center justify-center gap-3">
              <Image
                src="/redomiciled-logo.png"
                alt=""
                width={40}
                height={34}
                className="h-8 w-auto shrink-0 sm:h-9"
                priority
              />
              <p className="text-base font-semibold text-white sm:text-lg">
                Redomiciled
              </p>
            </div>
            <h1 className="text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">
              Book a call with us
            </h1>
          </div>
          <div className="min-h-0 overflow-hidden rounded-3xl border border-white/15 bg-black/18 p-2 shadow-2xl backdrop-blur-xl sm:p-3">
            <CalInlineEmbed submitted={submitted} />
          </div>
        </div>
      </section>
    );
  }

  const title = isUnqualified
    ? "Keep using the free Redomiciled community for now."
    : "Submission received";
  const description = isUnqualified
    ? "Based on your answers, the best next step is to keep using the free community for now. If your situation changes, or if you’re ready to invest at least €1,500 in professional support, you can submit again and we’ll route you to the right next step."
    : "We’ve received your submission. We’ll review the details and follow up if there is a clear next step.";

  if (isUnqualified) {
    return (
      <section className="mx-auto flex h-dvh w-full max-w-4xl flex-col justify-center overflow-hidden px-5 py-5 text-white sm:px-8 lg:px-10">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex w-fit items-center gap-3">
              <Image
                src="/redomiciled-logo.png"
                alt=""
                width={40}
                height={34}
                className="h-8 w-auto shrink-0 sm:h-9"
                priority
              />
              <p className="text-base font-semibold text-white sm:text-lg">
                Redomiciled
              </p>
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl leading-tight font-semibold sm:text-4xl lg:text-6xl">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/75 sm:text-base lg:text-lg lg:leading-7">
                {description}
              </p>
            </div>
          </div>
          <Button
            asChild
            className="h-12 w-fit rounded-xl bg-white px-5 font-semibold text-[#2422A1] hover:bg-white/90"
          >
            <a href="https://www.skool.com/redomiciled" target="_blank">
              Go to the free community
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex h-dvh w-full max-w-5xl flex-col justify-center overflow-hidden px-5 py-5 text-white sm:px-8 lg:px-10">
      <div className="grid min-h-0 gap-5">
        <div className="mx-auto flex w-fit items-center gap-3">
          <Image
            src="/redomiciled-logo.png"
            alt=""
            width={40}
            height={34}
            className="h-8 w-auto shrink-0 sm:h-9"
            priority
          />
          <p className="text-base font-semibold text-white sm:text-lg">
            Redomiciled
          </p>
        </div>
        <div className="min-h-0 overflow-hidden rounded-3xl border border-white/15 bg-black/18 p-4 shadow-2xl backdrop-blur-xl">
          <div className="grid min-h-[20rem] place-items-center rounded-2xl border border-white/10 bg-white/8 p-6 text-center">
            <div className="max-w-md space-y-4">
              <ClipboardCheck className="mx-auto size-9 text-[#A3A1FF]" />
              <h1 className="text-3xl font-semibold">{title}</h1>
              <p className="text-sm leading-6 text-white/70 sm:text-base">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
