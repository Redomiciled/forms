"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  CalendarCheck,
  ClipboardCheck,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { StartHereSubmissionSuccessResponse } from "@/lib/start-here-submission";

import { CalInlineEmbed } from "./cal-inline-embed";

export function SubmittedState({
  onReviewAnswers,
  submitted,
}: {
  onReviewAnswers: () => void;
  submitted: StartHereSubmissionSuccessResponse;
}) {
  const route = submitted.submission.fields.startHereFormRoute;
  const isBookedCall = route === "Booked Call";
  const isUnqualified = route === "Unqualified / Not Ready";
  const preBookingVideo = getPreBookingVideo(submitted);
  const [showBookingCalendar, setShowBookingCalendar] =
    useState(!preBookingVideo);

  if (isBookedCall && !showBookingCalendar && preBookingVideo) {
    return (
      <section className="mx-auto grid min-h-dvh w-full max-w-6xl place-items-center px-4 py-6 text-white sm:px-6 lg:h-dvh lg:min-h-0 lg:overflow-hidden lg:px-8">
        <h1 className="sr-only">{preBookingVideo.title}</h1>
        <div className="mx-auto grid w-full gap-4 sm:gap-5 lg:h-full lg:min-h-0 lg:grid-rows-[minmax(0,1fr)_auto] lg:items-center lg:gap-4">
          <div
            role="region"
            aria-label="Pre-booking video"
            className="mx-auto w-full max-w-full overflow-hidden lg:rounded-3xl lg:border lg:border-white/15 lg:bg-black/18 lg:p-3 lg:shadow-2xl lg:backdrop-blur-xl"
          >
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black sm:aspect-[16/10] lg:aspect-video lg:max-h-[calc(100dvh-9rem)]">
              <iframe
                title={preBookingVideo.title}
                src={preBookingVideo.embedUrl}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
          <Button
            type="button"
            className="mx-auto h-12 rounded-xl bg-white px-6 font-semibold text-[#2422A1] hover:bg-white/90"
            onClick={() => setShowBookingCalendar(true)}
          >
            <CalendarCheck className="size-4" />
            Book a Meeting
          </Button>
        </div>
      </section>
    );
  }

  if (isBookedCall) {
    return (
      <section className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col justify-start px-4 py-7 text-white sm:px-6 sm:py-8 lg:h-dvh lg:min-h-0 lg:justify-center lg:overflow-hidden lg:px-8 lg:py-6">
        <div className="grid gap-4 sm:gap-5 lg:h-full lg:min-h-0 lg:w-full lg:grid-rows-[auto_minmax(0,1fr)]">
          <div className="space-y-3 text-center sm:space-y-4">
            <div className="mx-auto flex w-fit items-center justify-center gap-3">
              <Image
                src="/redomiciled-logo.png"
                alt=""
                width={40}
                height={34}
                className="h-7 w-auto shrink-0 sm:h-9"
                priority
              />
              <p className="text-sm font-semibold text-white sm:text-lg">
                Redomiciled
              </p>
            </div>
            <h1 className="text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">
              Book a call with us
            </h1>
          </div>
          <div className="mx-auto w-full max-w-5xl overflow-visible rounded-3xl border border-white/15 bg-black/18 p-2 shadow-2xl backdrop-blur-xl sm:p-3 lg:h-full lg:min-h-0 lg:overflow-hidden">
            <CalInlineEmbed submitted={submitted} />
          </div>
        </div>
      </section>
    );
  }

  const title = isUnqualified
    ? "We’ve received your Start Here answers."
    : "Submission received";
  const description = isUnqualified
    ? "Based on what you shared, the best next step for now is to use the free Redomiciled community for more details and general guidance. If your situation changes, or you feel ready to invest at least €1,500 in professional support, you can review your answers and submit again so we can route you to the right next step."
    : "We’ve received your submission. We’ll review the details and follow up with the right next step.";

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
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-12 w-fit rounded-xl border-white/20 bg-white/8 px-5 font-semibold text-white hover:bg-white/14 hover:text-white"
              onClick={onReviewAnswers}
            >
              <ArrowLeft className="size-4" />
              Review answers
            </Button>
            <Button
              asChild
              className="h-12 w-fit rounded-xl bg-white px-5 font-semibold text-[#2422A1] hover:bg-white/90"
            >
              <a href="https://www.skool.com/redomiciled" target="_blank">
                Visit free community
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
          </div>
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

function getPreBookingVideo(submitted: StartHereSubmissionSuccessResponse) {
  const servicePath = submitted.submission.fields.servicePath;

  if (servicePath === "Banking") {
    return {
      title: "Banking path video",
      embedUrl:
        "https://www.youtube-nocookie.com/embed/2H_svyaQ23s?playsinline=1&rel=0",
    };
  }

  if (servicePath === "Bespoke plan") {
    return {
      title: "Bespoke path video",
      embedUrl:
        "https://www.youtube-nocookie.com/embed/-LCUxRiawjo?playsinline=1&rel=0",
    };
  }

  return null;
}
