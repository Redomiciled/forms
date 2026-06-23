"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  CalendarCheck,
  ClipboardCheck,
} from "lucide-react";
import Image from "next/image";
import Script from "next/script";
import { createElement, useState } from "react";

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
      <section className="text-ink mx-auto grid min-h-dvh w-full max-w-6xl place-items-center px-4 py-6 sm:px-6 lg:h-dvh lg:min-h-0 lg:overflow-hidden lg:px-8">
        <h1 className="sr-only">{preBookingVideo.title}</h1>
        <div className="mx-auto grid w-full gap-4 sm:gap-5 lg:h-full lg:min-h-0 lg:grid-rows-[minmax(0,1fr)_auto] lg:items-center lg:gap-4">
          <div
            role="region"
            aria-label="Pre-booking video"
            className="lg:border-line lg:bg-mist mx-auto w-full max-w-full overflow-hidden lg:rounded-3xl lg:border lg:p-3 lg:shadow-lg"
          >
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black sm:aspect-[16/10] lg:aspect-video lg:max-h-[calc(100dvh-9rem)]">
              <WistiaPlayer video={preBookingVideo} />
            </div>
          </div>
          <Button
            type="button"
            className="bg-brand text-paper hover:bg-brand-deep mx-auto h-12 rounded-xl px-6 font-semibold"
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
      <section className="text-ink mx-auto flex min-h-dvh w-full max-w-7xl flex-col justify-start px-4 py-7 sm:px-6 sm:py-8 lg:h-dvh lg:min-h-0 lg:justify-center lg:overflow-hidden lg:px-8 lg:py-6">
        <div className="grid gap-4 sm:gap-5 lg:h-full lg:min-h-0 lg:w-full lg:grid-rows-[auto_minmax(0,1fr)]">
          <div className="space-y-3 text-center sm:space-y-4">
            <div className="mx-auto flex w-fit items-center justify-center">
              <Image
                src="/redomiciled-logo.webp"
                alt="Redomiciled"
                width={166}
                height={29}
                className="h-7 w-auto shrink-0"
                priority
              />
              <span className="sr-only">Redomiciled</span>
            </div>
            <h1 className="font-heading text-ink text-3xl leading-tight font-medium sm:text-4xl lg:text-5xl">
              Book a call with us
            </h1>
          </div>
          <div className="border-line bg-mist mx-auto w-full max-w-5xl overflow-visible rounded-3xl border p-2 shadow-lg sm:p-3 lg:h-full lg:min-h-0 lg:overflow-hidden">
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
      <section className="text-ink mx-auto flex h-dvh w-full max-w-4xl flex-col justify-center overflow-hidden px-5 py-5 sm:px-8 lg:px-10">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex w-fit items-center">
              <Image
                src="/redomiciled-logo.webp"
                alt="Redomiciled"
                width={166}
                height={29}
                className="h-7 w-auto shrink-0"
                priority
              />
              <span className="sr-only">Redomiciled</span>
            </div>
            <div className="space-y-4">
              <h1 className="font-heading text-ink max-w-3xl text-3xl leading-tight font-medium sm:text-4xl lg:text-6xl">
                {title}
              </h1>
              <p className="text-stone max-w-2xl text-sm leading-6 sm:text-base lg:text-lg lg:leading-7">
                {description}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="border-line bg-paper text-ink hover:border-brand hover:bg-mist hover:text-brand h-12 w-fit rounded-xl px-5 font-semibold"
              onClick={onReviewAnswers}
            >
              <ArrowLeft className="size-4" />
              Review answers
            </Button>
            <Button
              asChild
              className="bg-brand text-paper hover:bg-brand-deep h-12 w-fit rounded-xl px-5 font-semibold"
            >
              <a href="https://www.skool.com/redomiciled-5554" target="_blank">
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
    <section className="text-ink mx-auto flex h-dvh w-full max-w-5xl flex-col justify-center overflow-hidden px-5 py-5 sm:px-8 lg:px-10">
      <div className="grid min-h-0 gap-5">
        <div className="mx-auto flex w-fit items-center">
          <Image
            src="/redomiciled-logo.webp"
            alt="Redomiciled"
            width={166}
            height={29}
            className="h-7 w-auto shrink-0"
            priority
          />
          <span className="sr-only">Redomiciled</span>
        </div>
        <div className="border-line bg-mist min-h-0 overflow-hidden rounded-3xl border p-4 shadow-lg">
          <div className="border-line bg-paper grid min-h-[20rem] place-items-center rounded-2xl border p-6 text-center">
            <div className="max-w-md space-y-4">
              <ClipboardCheck className="text-brand mx-auto size-9" />
              <h1 className="font-heading text-ink text-3xl font-medium">
                {title}
              </h1>
              <p className="text-stone text-sm leading-6 sm:text-base">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WistiaPlayer({
  video,
}: {
  video: {
    mediaId: string;
    title: string;
  };
}) {
  const fallbackStyles = `
    wistia-player[media-id='${video.mediaId}']:not(:defined) {
      background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/${video.mediaId}/swatch');
      display: block;
      filter: blur(5px);
      height: 100%;
      width: 100%;
    }
  `;

  return (
    <>
      <Script
        src="https://fast.wistia.com/player.js"
        strategy="afterInteractive"
      />
      <Script
        src={`https://fast.wistia.com/embed/${video.mediaId}.js`}
        strategy="afterInteractive"
        type="module"
      />
      <style>{fallbackStyles}</style>
      {createElement("wistia-player", {
        aspect: "1.7777777777777777",
        className: "block h-full w-full",
        "media-id": video.mediaId,
        title: video.title,
      })}
    </>
  );
}

function getPreBookingVideo(submitted: StartHereSubmissionSuccessResponse) {
  const servicePath = submitted.submission.fields.servicePath;

  if (servicePath === "Banking") {
    return {
      title: "Banking path video",
      mediaId: "3b6qkkvvq7",
    };
  }

  if (servicePath === "Bespoke plan") {
    return {
      title: "Bespoke path video",
      mediaId: "omfxogl4rp",
    };
  }

  return null;
}
