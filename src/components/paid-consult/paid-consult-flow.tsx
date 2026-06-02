"use client";

import {
  AlertCircle,
  CalendarCheck,
  Check,
  CircleCheck,
  ClipboardCheck,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  buildTallyMsaEmbedUrl,
  getPaidConsultCalEmbedOptions,
  isPaidConsultConfigured,
  type PaidConsultConfig,
  type PaidConsultPreviewState,
} from "@/lib/paid-consult";

import { PaidCalInlineEmbed } from "./paid-cal-inline-embed";
import { TallyMsaEmbed } from "./tally-msa-embed";

type PaidConsultFlowProps = {
  config: PaidConsultConfig;
  hasInvalidTaskId: boolean;
  previewState?: PaidConsultPreviewState | null;
  taskId: string | null;
};

export function PaidConsultFlow({
  config,
  hasInvalidTaskId,
  previewState = null,
  taskId,
}: PaidConsultFlowProps) {
  const [msaSubmitted, setMsaSubmitted] = useState(false);
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const configured = isPaidConsultConfigured(config);
  const visibleState =
    previewState ?? (bookingCompleted ? "complete" : msaSubmitted ? 2 : 1);
  const tallyEmbedUrl = useMemo(() => {
    if (!taskId || !config.tallyFormId) {
      return "";
    }

    return buildTallyMsaEmbedUrl({
      formId: config.tallyFormId,
      taskId,
    });
  }, [config.tallyFormId, taskId]);
  const calEmbedOptions = useMemo(() => {
    if (!taskId || !config.calLink) {
      return null;
    }

    return getPaidConsultCalEmbedOptions({
      calLink: config.calLink,
      taskId,
    });
  }, [config.calLink, taskId]);

  return (
    <section className="mx-auto grid min-h-dvh w-full max-w-[96rem] gap-5 px-5 py-5 text-white sm:px-8 sm:py-7 lg:h-dvh lg:min-h-0 lg:grid-cols-[0.52fr_1.48fr] lg:gap-6 lg:overflow-hidden lg:px-6 lg:py-4 xl:max-w-[104rem]">
      <aside className="flex min-h-0 flex-col justify-center gap-5 lg:gap-6">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
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
            <p className="text-sm font-medium text-[#B9B7FF]">Paid consult</p>
            <h1 className="max-w-2xl text-3xl leading-tight font-semibold sm:text-5xl lg:text-6xl">
              Finalize your consult booking.
            </h1>
            <p className="max-w-xl text-sm leading-6 text-white/72 sm:text-base lg:text-lg lg:leading-7">
              Complete the agreement, then book and pay for your private
              Redomiciled consult.
            </p>
          </div>
        </div>

        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <StepItem
            active={Boolean(taskId && configured && visibleState === 1)}
            complete={Boolean(taskId && configured && visibleState !== 1)}
            index={1}
            label="Service agreement"
          />
          <StepItem
            active={Boolean(taskId && configured && visibleState === 2)}
            complete={Boolean(
              taskId && configured && visibleState === "complete"
            )}
            index={2}
            label="Paid booking"
          />
        </ol>
      </aside>

      <div className="flex min-h-0 flex-col justify-center lg:h-full">
        <div className="min-h-0 rounded-3xl border border-white/16 bg-white/12 p-3 shadow-2xl backdrop-blur-2xl sm:p-4 lg:max-h-full xl:p-3">
          <div className="flex min-h-[32rem] flex-col rounded-2xl border border-white/10 bg-[#0C0C2E]/45 p-4 sm:p-5 lg:h-[calc(100dvh-4rem)] lg:min-h-0">
            {!taskId ? (
              <RouteIssueState hasInvalidTaskId={hasInvalidTaskId} />
            ) : !configured ? (
              <ConfigurationPendingState />
            ) : visibleState === 1 ? (
              <div className="flex min-h-0 flex-1 flex-col gap-3">
                <PanelHeader
                  icon={<ClipboardCheck className="size-4" />}
                  title="Service agreement"
                  description="Review and sign the agreement to continue to the booking calendar."
                />
                <TallyMsaEmbed
                  embedUrl={tallyEmbedUrl}
                  formId={config.tallyFormId}
                  onSubmitted={() => setMsaSubmitted(true)}
                />
              </div>
            ) : visibleState === 2 ? (
              <div className="flex min-h-0 flex-1 flex-col gap-3">
                <PanelHeader
                  icon={<CalendarCheck className="size-4" />}
                  title="Book and pay for your consult"
                  description="Choose an available time and complete payment through Redomiciled's booking calendar."
                />
                <PaidCalInlineEmbed
                  embedOptions={calEmbedOptions}
                  onBookingCompleted={() => setBookingCompleted(true)}
                />
              </div>
            ) : (
              <BookingCompleteState />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function BookingCompleteState() {
  return (
    <div
      role="region"
      aria-label="Booking confirmation"
      className="grid min-h-[32rem] flex-1 place-items-center rounded-2xl border border-white/15 bg-white p-6 text-center text-[#111]"
    >
      <div className="max-w-lg space-y-5">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <CircleCheck className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold">Booking received.</h2>
          <p className="text-sm leading-6 text-black/65 sm:text-base">
            Your paid consult booking has been submitted. Redomiciled will send
            the correct follow-up details for your consult route.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepItem({
  active,
  complete,
  index,
  label,
}: {
  active: boolean;
  complete: boolean;
  index: number;
  label: string;
}) {
  return (
    <li
      className={[
        "flex min-w-0 items-center justify-between gap-3 rounded-2xl border px-4 py-3 backdrop-blur",
        active
          ? "border-white/38 bg-white/18 shadow-[0_0_34px_rgba(92,89,255,0.28)]"
          : complete
            ? "border-white/20 bg-white/10"
            : "border-white/10 bg-white/6",
      ].join(" ")}
    >
      <span className="min-w-0">
        <span className="block text-xs text-white/50">Step {index}</span>
        <span className="block truncate text-sm font-semibold text-white">
          {label}
        </span>
      </span>
      <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-xs">
        {complete ? <Check className="size-4" /> : index}
      </span>
    </li>
  );
}

function PanelHeader({
  description,
  icon,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-[#B9B7FF]">
        {icon}
      </div>
      <div className="min-w-0 space-y-0.5">
        <h2 className="text-xl font-semibold leading-tight text-white">
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-5 text-white/68">
          {description}
        </p>
      </div>
    </div>
  );
}

function RouteIssueState({ hasInvalidTaskId }: { hasInvalidTaskId: boolean }) {
  return (
    <CenteredState
      icon={<AlertCircle className="size-9" />}
      title="This consult link is incomplete"
      description={
        hasInvalidTaskId
          ? "The link does not match an active Redomiciled consult invite."
          : "Use the private consult link Redomiciled sent you to continue."
      }
    />
  );
}

function ConfigurationPendingState() {
  return (
    <CenteredState
      icon={<ClipboardCheck className="size-9" />}
      title="This consult page is being finalized"
      description="Redomiciled is preparing the agreement and paid booking calendar. Please use the latest link from the team."
    />
  );
}

function CenteredState({
  description,
  icon,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="grid min-h-[28rem] place-items-center text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-white/14 bg-white/10 text-[#B9B7FF]">
          {icon}
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-white">{title}</h2>
          <p className="text-sm leading-6 text-white/68 sm:text-base">
            {description}
          </p>
        </div>
        <Button
          asChild
          className="h-11 rounded-xl bg-white px-5 font-semibold text-[#2422A1] hover:bg-white/90"
        >
          <a href="mailto:team@redomiciled.com">Contact Redomiciled</a>
        </Button>
      </div>
    </div>
  );
}
