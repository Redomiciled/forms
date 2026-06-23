"use client";

import { useEffect, useState } from "react";

type TallyWidgetApi = {
  loadEmbeds: () => void;
};

type TallyWindow = Window &
  typeof globalThis & {
    Tally?: TallyWidgetApi;
  };

export function TallyMsaEmbed({
  embedUrl,
  formId,
  onSubmitted,
}: {
  embedUrl: string;
  formId: string;
  onSubmitted: () => void;
}) {
  const [embedFailed, setEmbedFailed] = useState(false);

  useEffect(() => {
    let active = true;

    function handleSubmitted(event: MessageEvent) {
      if (event.origin !== "https://tally.so") {
        return;
      }

      if (!isTallySubmittedEvent(event.data)) {
        return;
      }

      const eventFormId = getTallyEventFormId(event.data);

      if (eventFormId && eventFormId !== formId) {
        return;
      }

      onSubmitted();
    }

    window.addEventListener("message", handleSubmitted);
    loadTallyEmbeds(() => {
      if (active) {
        setEmbedFailed(true);
      }
    });

    return () => {
      active = false;
      window.removeEventListener("message", handleSubmitted);
    };
  }, [formId, onSubmitted]);

  return (
    <div
      role="region"
      aria-label="Service agreement"
      className="border-line bg-paper text-ink min-h-[28rem] flex-1 overflow-hidden rounded-2xl border"
    >
      {embedFailed ? (
        <div className="border-line bg-brand/5 text-brand border-b px-4 py-3 text-center text-sm font-medium">
          Agreement form unavailable. Refresh the page to load it again.
        </div>
      ) : null}
      <iframe
        className="h-full min-h-[28rem] w-full"
        data-tally-src={embedUrl}
        height="100%"
        loading="lazy"
        src={embedUrl}
        style={{ border: 0 }}
        title="Redomiciled paid consult service agreement"
      />
    </div>
  );
}

function loadTallyEmbeds(onError: () => void) {
  const tallyWindow = window as TallyWindow;

  if (tallyWindow.Tally?.loadEmbeds) {
    tallyWindow.Tally.loadEmbeds();
    return;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    'script[src="https://tally.so/widgets/embed.js"]'
  );

  if (existingScript) {
    existingScript.addEventListener("load", () => {
      tallyWindow.Tally?.loadEmbeds();
    });
    existingScript.addEventListener("error", onError);
    return;
  }

  const script = document.createElement("script");
  script.src = "https://tally.so/widgets/embed.js";
  script.async = true;
  script.onload = () => tallyWindow.Tally?.loadEmbeds();
  script.onerror = onError;
  document.head.append(script);
}

function isTallySubmittedEvent(value: unknown) {
  const event = getTallyEventRecord(value);

  return (
    event !== null &&
    typeof event["event"] === "string" &&
    event["event"] === "Tally.FormSubmitted"
  );
}

function getTallyEventFormId(value: unknown) {
  const event = getTallyEventRecord(value);

  if (!event) {
    return "";
  }

  const formId = getStringValue(event["formId"]);

  if (formId) {
    return formId;
  }

  if (isRecord(event["form"])) {
    return getStringValue(event["form"]["id"]);
  }

  if (isRecord(event["payload"])) {
    return getStringValue(event["payload"]["formId"]);
  }

  return "";
}

function getTallyEventRecord(value: unknown): Record<string, unknown> | null {
  if (isRecord(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
