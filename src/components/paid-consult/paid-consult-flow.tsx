"use client";

import {
  AlertCircle,
  CalendarCheck,
  Check,
  CircleCheck,
  ClipboardCheck,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  buildTallyMsaEmbedUrl,
  getPaidConsultCalEmbedOptions,
  isPaidConsultConfigured,
  type PaidConsultConfig,
  type PaidConsultPrefill,
  type PaidConsultPreviewState,
} from "@/lib/paid-consult";

import { PaidCalInlineEmbed } from "./paid-cal-inline-embed";
import { TallyMsaEmbed } from "./tally-msa-embed";

type PaidConsultFlowProps = {
  config: PaidConsultConfig;
  hasInvalidTaskId: boolean;
  prefill?: PaidConsultPrefill | null;
  previewState?: PaidConsultPreviewState | null;
  taskId: string | null;
};

export function PaidConsultFlow({
  config,
  hasInvalidTaskId,
  prefill = null,
  previewState = null,
  taskId,
}: PaidConsultFlowProps) {
  const [msaSubmitted, setMsaSubmitted] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
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
      prefill,
      taskId,
    });
  }, [config.tallyFormId, prefill, taskId]);
  const calEmbedOptions = useMemo(() => {
    if (!taskId || !config.calLink) {
      return null;
    }

    return getPaidConsultCalEmbedOptions({
      calLink: config.calLink,
      paidConsultOwner: config.paidConsultOwner,
      prefill,
      taskId,
    });
  }, [config.calLink, config.paidConsultOwner, prefill, taskId]);
  const handleBookingSubmitted = useCallback(() => {
    setBookingSubmitted(true);
  }, []);

  useEffect(() => {
    if (!taskId || !configured || bookingCompleted) {
      return;
    }

    let active = true;

    async function checkExistingCompletion() {
      try {
        if (!(await fetchPaidConsultCompletion(taskId!))) {
          return;
        }

        if (active) {
          setBookingCompleted(true);
        }
      } catch {
        // If the status check is unavailable, keep the normal agreement flow visible.
      }
    }

    void checkExistingCompletion();

    return () => {
      active = false;
    };
  }, [bookingCompleted, configured, taskId]);

  useEffect(() => {
    if (!bookingSubmitted || !taskId || bookingCompleted) {
      return;
    }

    let active = true;
    let timeoutId: number | undefined;

    async function checkCompletion() {
      try {
        if (await fetchPaidConsultCompletion(taskId!)) {
          if (!active) {
            return;
          }

          setBookingCompleted(true);
          return;
        }
      } catch {
        // Keep the calendar visible; the webhook/ClickUp path is the source of truth.
      }

      if (active) {
        timeoutId = window.setTimeout(checkCompletion, 3000);
      }
    }

    void checkCompletion();

    return () => {
      active = false;

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [bookingCompleted, bookingSubmitted, taskId]);

  return (
    <section className="text-ink mx-auto grid min-h-dvh w-full max-w-[96rem] gap-5 px-5 py-5 sm:px-8 sm:py-7 lg:h-dvh lg:min-h-0 lg:grid-cols-[0.7fr_1.3fr] lg:gap-6 lg:overflow-hidden lg:px-6 lg:py-4 xl:max-w-[104rem]">
      <aside className="flex min-h-0 flex-col justify-center gap-5 lg:gap-6">
        <div className="space-y-5">
          <div className="flex items-center">
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
            <p className="text-brand text-sm font-medium">Paid consult</p>
            <h1 className="font-heading text-ink max-w-2xl text-3xl leading-tight font-medium sm:text-5xl lg:text-6xl">
              Finalize your consult booking.
            </h1>
            <p className="text-stone max-w-xl text-sm leading-6 sm:text-base lg:text-lg lg:leading-7">
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
        <div className="border-line bg-mist min-h-0 rounded-3xl border p-3 shadow-lg sm:p-4 lg:max-h-full xl:p-3">
          <div className="border-line bg-paper flex min-h-[32rem] flex-col rounded-2xl border p-4 sm:p-5 lg:h-[calc(100dvh-4rem)] lg:min-h-0">
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
                {bookingSubmitted ? (
                  <p
                    role="status"
                    className="border-line bg-brand/5 text-stone rounded-xl border px-3 py-2 text-sm"
                  >
                    Confirming your paid booking with Redomiciled. Keep this
                    page open for a moment.
                  </p>
                ) : null}
                <PaidCalInlineEmbed
                  embedOptions={calEmbedOptions}
                  onBookingSubmitted={handleBookingSubmitted}
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

async function fetchPaidConsultCompletion(taskId: string) {
  const response = await fetch(
    `/api/paid-consult/status?id=${encodeURIComponent(taskId)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as { completed?: unknown };
  return data.completed === true;
}

function BookingCompleteState() {
  return (
    <div
      role="region"
      aria-label="Booking confirmation"
      className="border-line bg-paper text-ink grid min-h-[32rem] flex-1 place-items-center rounded-2xl border p-6 text-center"
    >
      <div className="max-w-lg space-y-5">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <CircleCheck className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-ink text-3xl font-medium">
            Booking received.
          </h2>
          <p className="text-stone text-sm leading-6 sm:text-base">
            Your paid consult is confirmed. Redomiciled will send the next form
            for your consult route shortly.
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
        "flex min-w-0 items-center justify-between gap-3 rounded-2xl border px-4 py-3",
        active
          ? "border-brand bg-brand/5 shadow-sm"
          : complete
            ? "border-brand/30 bg-paper"
            : "border-line bg-paper",
      ].join(" ")}
    >
      <span className="min-w-0">
        <span className="text-stone block text-xs">Step {index}</span>
        <span className="text-ink block truncate text-sm font-semibold">
          {label}
        </span>
      </span>
      <span className="border-line bg-mist text-ink grid size-7 shrink-0 place-items-center rounded-full border text-xs">
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
      <div className="border-line bg-mist text-brand grid size-8 shrink-0 place-items-center rounded-xl border">
        {icon}
      </div>
      <div className="min-w-0 space-y-0.5">
        <h2 className="font-heading text-ink text-xl leading-tight font-medium">
          {title}
        </h2>
        <p className="text-stone max-w-2xl text-sm leading-5">{description}</p>
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
        <div className="border-line bg-mist text-brand mx-auto grid size-14 place-items-center rounded-2xl border">
          {icon}
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-ink text-3xl font-medium">
            {title}
          </h2>
          <p className="text-stone text-sm leading-6 sm:text-base">
            {description}
          </p>
        </div>
        <Button
          asChild
          className="bg-brand text-paper hover:bg-brand-deep h-11 rounded-xl px-5 font-semibold"
        >
          <a href="mailto:team@redomiciled.com">Contact Redomiciled</a>
        </Button>
      </div>
    </div>
  );
}
