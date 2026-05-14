# Cal.com Booking Capture Research

> Research date: 2026-05-14 | Status: complete
> Scope: Determine whether the Start Here form can capture when a Cal.com meeting was booked from the embedded calendar, and what implementation path is safest.

## Summary

Yes, we can capture that a meeting was booked, but the current implementation cannot do it yet. The form currently renders Cal.com as a plain iframe; Cal.com's documented booking-success events require the Cal embed API event listener, and the canonical booked-at timestamp is best sourced from Cal.com webhook/API booking data rather than inferred only in the browser.

Recommendation: switch the booked-call screen from a raw iframe to the official Cal.com inline embed API, pass the Start Here `submissionId` and ClickUp `taskId` into Cal metadata, listen for `bookingSuccessfulV2` for immediate UX/update, and add a `BOOKING_CREATED` webhook as the source of truth for ClickUp fields.

## What The Current Form Does

The Start Here form posts validated answers to the local API route, then only sets React state to the prepared submission object:

> "const response = await fetch(\"/api/start-here/submissions\", {"  
> "setSubmitted(result.submission);"
>
> - Source: `src/components/start-here-form.tsx` (lines 177-194)

**Reasoning:** The UI loses `result.persistence.submissionId` and `result.persistence.taskId`, even though the API response contains them. That makes later booking reconciliation harder unless we match by email or rework the state shape.

The server route already returns both the prepared submission and persistence result:

> "submission: result.submission,"  
> "persistence: result.persistence,"
>
> - Source: `src/app/api/start-here/submissions/route.ts` (lines 35-39)

The persistence layer creates a local submission ID, prepares routing, writes/updates ClickUp in live mode, then returns the ClickUp task ID:

> "const submissionId = globalThis.crypto.randomUUID();"  
> "const submission = prepareStartHereSubmission(values);"  
> "taskId,"
>
> - Source: `src/lib/start-here-clickup.ts` (lines 199-200, 241-248)

Booked-call routes currently select Will for banking and Erik for everything else, but both point to the same placeholder/test Cal URL:

> "erik: \"https://cal.com/juan-hernandez-obduvq/30min\","  
> "will: \"https://cal.com/juan-hernandez-obduvq/30min\","
>
> - Source: `src/lib/start-here-routing.ts` (lines 8-10)

The submitted booked-call screen renders `CalInlineEmbed`, which is currently a normal iframe:

> "<iframe"  
> "src={bookingUrl}"
>
> - Source: `src/components/start-here/cal-inline-embed.tsx` (lines 34-40)

The iframe URL pre-fills name, email, phone, and some metadata-like query params:

> "baseUrl.searchParams.set(\"email\", submitted.fields.email);"  
> "\"metadata[startHereFormRoute]\","
>
> - Source: `src/components/start-here/cal-inline-embed.tsx` (lines 51-76)

**Reasoning:** This is useful for prefill, but it does not register `Cal(\"on\", ...)` listeners, so the parent page has no documented Cal.com event callback when booking succeeds.

The current field map expects `Cal.com Booking ID` to be blank until Cal confirms a booking:

> "Prepared value: empty until Cal.com confirms a booking."
>
> - Source: `docs/reference/start-here-form-clickup-field-map.md` (lines 184-188)

## Cal.com Embed Capabilities

Cal.com's inline embed is the supported path for embedding an event type inside a page:

> "Show the embed inline anywhere on the webpage."
>
> - Source: [Adding embed to your webpage](https://cal.com/help/embedding/adding-embed)

The official inline instruction accepts a page element and a Cal link:

> "Cal(\"inline\", { elementOrSelector, calLink });"
>
> - Source: [Embed instructions](https://cal.com/help/embedding/embed-instructions)

Cal.com's embed events support listening from the parent page:

> "Cal(\"on\", {"
>
> - Source: [Embed Events](https://cal.com/help/embedding/embed-events)

The key event is `bookingSuccessfulV2`, which fires when a fresh booking is completed and includes the booking UID plus the meeting start/end times:

> "When a fresh booking is successfully done."
>
> - Source: [Embed Events](https://cal.com/help/embedding/embed-events)

**Reasoning:** The embed event can tell the form "a booking happened" immediately. It includes `uid`, `startTime`, `endTime`, status, event type ID, and video URL, but the docs do not list a booking `createdAt` timestamp in the embed event payload.

Cal.com supports metadata in embed prefill config, and says it is available in webhook payload metadata and stored on the booking:

> "You will receive the value in payload.metadata[\"myKey\"] in webhook."
>
> - Source: [Prefill booking form in Embed](https://cal.com/help/embedding/prefill-booking-form-embed)

**Reasoning:** We should pass `startHereSubmissionId`, `clickUpTaskId`, route, and owner as metadata. That makes the webhook deterministic and avoids brittle email-only matching.

## Cal.com Webhook / API Capabilities

Cal.com webhooks are intended for automations when invitees schedule, cancel, or reschedule:

> "when invitees schedule, cancel or reschedule events"
>
> - Source: [Webhooks](https://cal.com/docs/developing/guides/automation/webhooks)

Webhook subscriptions can be associated with users and individual event types:

> "associated with user as well as individual event types"
>
> - Source: [Webhooks](https://cal.com/docs/developing/guides/automation/webhooks)

Webhook payloads include a top-level `createdAt`, and the variable list defines it as webhook time:

> "createdAt Datetime The time of the webhook"
>
> - Source: [Webhooks](https://cal.com/docs/developing/guides/automation/webhooks)

Webhook variables include booking UID and metadata:

> "uid String The UID of the booking"  
> "metadata JSON Contains metadata of the booking"
>
> - Source: [Webhooks](https://cal.com/docs/developing/guides/automation/webhooks)

The Cal.com bookings API returns booking `createdAt`, and the list endpoint documents sorting by creation time as "when booking was made":

> "Sort results by their creation time (when booking was made)"
>
> - Source: [Get all bookings](https://cal.com/docs/api-reference/v2/bookings/get-all-bookings)

**Reasoning:** If Redomiciled needs the exact "booked at" timestamp, use the webhook as the trigger and either store webhook `createdAt` as the automation-received time or fetch the booking by UID to store Cal.com's booking `createdAt`.

The get-booking endpoint accepts the booking UID:

> "`:bookingUid` can be uid of a normal booking"
>
> - Source: [Get a booking](https://cal.com/docs/api-reference/v2/bookings/get-a-booking)

## Options

| Option                                          | Captures booking happened? | Captures reliable booked-at? |      Effort |   Risk | Notes                                                                                            |
| ----------------------------------------------- | -------------------------: | ---------------------------: | ----------: | -----: | ------------------------------------------------------------------------------------------------ |
| Keep raw iframe and poll Cal API later          |                    Partial |     Yes, if API access works |      Medium | Medium | No immediate UX callback; matching is weaker unless metadata/query params are definitely stored. |
| Official embed API + `bookingSuccessfulV2` only |                        Yes |       Browser timestamp only |      Medium | Medium | Good immediate UX, but browser event can be missed if user closes page or network fails.         |
| Cal webhook only                                |                        Yes |                          Yes |      Medium |    Low | Best source of truth, but UI will not immediately know unless it also listens to embed event.    |
| Embed event + webhook/API                       |                        Yes |                          Yes | Medium-high |    Low | Recommended. Immediate UX plus backend reconciliation.                                           |

## Recommended Implementation

1. Change `CalInlineEmbed` from a raw iframe to the official Cal.com inline embed script/API.
2. Store the whole successful response in form state, not just `result.submission`, so `persistence.submissionId` and `persistence.taskId` are available to the booked-call screen.
3. Pass metadata into the Cal embed config:
   - `metadata[startHereSubmissionId]`
   - `metadata[clickUpTaskId]`
   - `metadata[startHereFormRoute]`
   - `metadata[bookedCallOwner]`
   - `metadata[leadSourceDetail]`
4. Listen for `bookingSuccessfulV2` and POST the event payload to a new server route, e.g. `/api/start-here/cal-bookings`.
5. Add a Cal.com `BOOKING_CREATED` webhook for Will and Erik's relevant event types. The webhook should update the existing ClickUp task by `metadata.clickUpTaskId` first, then fall back to `metadata.startHereSubmissionId`, then email only as a last resort.
6. Store at least:
   - `Cal.com Booking ID` = `uid`
   - `Cal.com Booking Created At` = booking `createdAt` from Cal API if available, otherwise webhook `createdAt`
   - `Meeting Start Time` = `startTime`
   - `Meeting End Time` = `endTime`
   - `Cal.com Booking Status` = `status`

## ClickUp Field Implication

ClickUp currently has `Cal.com Booking ID`, but the local field map does not list a field for booked-at time. If the business question is specifically "when was the meeting booked?", add a new date/time custom field such as `Cal.com Booking Created At`. Do not overload `Meeting Start Time`; that answers a different question.

## Will / Erik Account Checks

- Replace the current shared placeholder URL with Will's real Cal event link for banking routes.
- Confirm whether "Erik's account" is the Cal host account for non-banking routes, and resolve the name mismatch in docs/code (`Eric` vs `Erik`) before wiring production owner IDs.
- In each account/event type, confirm webhook access and whether the event type requires confirmation. `bookingSuccessfulV2` can fire even when the booking might not be confirmed, so status handling matters.
- Create a test booking through each embedded link and verify:
  - metadata lands in the booking/webhook payload,
  - webhook fires,
  - booking UID is present,
  - API `createdAt` is readable with the available token/account access,
  - ClickUp update can target the original task without email matching.

## Key Findings

1. The current raw iframe cannot capture Cal.com booking-success events from the parent form.
2. Cal.com's official embed API exposes `bookingSuccessfulV2` with booking UID and meeting start/end times, but not a documented booked-at timestamp.
3. The reliable booked-at timestamp should come from Cal.com webhook/API data, especially API booking `createdAt`.
4. The current form already creates/updates ClickUp before showing the calendar, but drops the returned `submissionId`/`taskId` from client state.
5. The current ClickUp schema has `Cal.com Booking ID`; it needs a separate date/time field if Redomiciled wants to report when the booking was made.

## Open Questions

- [ ] Do we have API/webhook permissions in Will's Cal.com account and Erik's Cal.com account?
- [ ] Are Will and Erik using separate user-owned event types, team event types, or one organization account?
- [ ] Should ClickUp status change to `meeting booked` after the booking webhook, or should status remain separate from route fields until a human reviews?
- [ ] Should the browser event update ClickUp immediately, or should it only show UX confirmation while the webhook owns durable CRM updates?

## Next Steps

- [ ] Inspect Will's real Cal link and Erik's account/event type setup.
- [ ] Add a ClickUp field for `Cal.com Booking Created At` if the client wants this tracked.
- [ ] Replace raw iframe embed with official Cal.com inline embed API.
- [ ] Carry `submissionId` and `taskId` into the booked-call screen and Cal metadata.
- [ ] Add a booking webhook endpoint and idempotent ClickUp update path keyed by Cal booking UID.

## Sources

- `src/components/start-here-form.tsx` (lines 177-194) — current submit flow and dropped persistence data.
- `src/app/api/start-here/submissions/route.ts` (lines 35-39) — response shape includes persistence.
- `src/lib/start-here-clickup.ts` (lines 199-248) — submission ID, ClickUp write, returned task ID.
- `src/lib/start-here-routing.ts` (lines 8-10, 297-310) — current Will/Erik owner URLs.
- `src/components/start-here/cal-inline-embed.tsx` (lines 34-76) — current iframe embed and prefill params.
- `docs/reference/start-here-form-clickup-field-map.md` (lines 184-188) — booking ID is intentionally empty until Cal confirmation.
- [Cal.com: Adding embed to your webpage](https://cal.com/help/embedding/adding-embed) — inline embed support.
- [Cal.com: Embed instructions](https://cal.com/help/embedding/embed-instructions) — official `Cal("inline")` usage.
- [Cal.com: Embed Events](https://cal.com/help/embedding/embed-events) — `bookingSuccessfulV2` event and payload.
- [Cal.com: Prefill booking form in Embed](https://cal.com/help/embedding/prefill-booking-form-embed) — metadata passed into webhook/bookings.
- [Cal.com: Webhooks](https://cal.com/docs/developing/guides/automation/webhooks) — booking-created automation payload concepts.
- [Cal.com: Get all bookings](https://cal.com/docs/api-reference/v2/bookings/get-all-bookings) — booking `createdAt` and creation-time sorting.
- [Cal.com: Get a booking](https://cal.com/docs/api-reference/v2/bookings/get-a-booking) — fetch booking by UID.
