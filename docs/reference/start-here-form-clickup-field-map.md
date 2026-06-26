# Start Here Form ClickUp Field Map

This repo-local map is limited to values the Start Here form collects or prepares at submission time. It intentionally excludes downstream funnel fields such as Brevo sync, MSA, payment, and recommendation call state. Keep it in sync with the live client-level field map when ClickUp schema IDs or options change.

## Integration Placeholders

- `CLICKUP_LIST_ID`: `901217458864`
- `CLICKUP_LEAD_TASK_TYPE_ID`: `1001`
- `CLICKUP_FIELD_ID_FIRST_NAME`: `b6b2590d-58a3-463b-8e38-691c791e0f7f`
- `CLICKUP_FIELD_ID_LAST_NAME`: `c63b5e5a-220f-49f2-8b0f-1da4137139d1`
- `CLICKUP_FIELD_ID_EMAIL`: `cfe207d1-c5a3-47b7-bd72-eae0d5c0c708`
- `CLICKUP_FIELD_ID_PHONE`: `3a356107-fadc-41c2-90fd-46b4af007fdf`
- `CLICKUP_FIELD_ID_LEAD_SOURCE`: `ca71b224-d78d-4b83-ac83-f78a6ac50054`
- `CLICKUP_FIELD_ID_START_HERE_ANSWERS`: `fa954f53-1c02-4c8e-aaab-e90259a8250c`
- `CLICKUP_FIELD_ID_START_HERE_FORM_ROUTE`: `0ed775f3-ae23-43ea-8f70-d1ecd161a301`
- `CLICKUP_FIELD_ID_START_HERE_FORM_ROUTE_REASON`: `86714782-7be3-4823-9095-de518c8057c5`
- `CLICKUP_FIELD_ID_ROUTING_DECISION_SIGNALS`: `aa730523-3be9-4f95-abe4-82548635ddda`
- `CLICKUP_FIELD_ID_SERVICE_PATH`: `f8578a38-9aa4-4355-bf75-72eeb780fbc2`
- `CLICKUP_FIELD_ID_BOOKED_CALL_OWNER`: `580ba4f1-6479-4255-a0c5-be049e3b4e21`
- `CLICKUP_FIELD_ID_CAL_COM_BOOKING_ID`: `7d5007ea-07e9-4796-a656-49e8548a032c`
- `CAL_COM_OWNER_ERIK_URL`: `https://cal.com/eric-redomiciled/30min`
- `CAL_COM_OWNER_WILL_URL`: `https://cal.com/william-denton-redomiciled/meeting-with-william`

## Native ClickUp Status Mapping

The form preserves `Start Here Form Route` as a custom field for routing/audit history, and separately sets the ClickUp task's native status when creating or updating the CRM task.

| Start Here route          | Native ClickUp status |
| ------------------------- | --------------------- |
| `Booked Call`             | `MEETING BOOKED`      |
| `Manual Triage`           | `MANUAL TRIAGE`       |
| `Unqualified / Not Ready` | `NOT READY`           |

Current confirmed CRM native statuses:

- `MEETING BOOKED`
- `NOT READY`
- `MANUAL TRIAGE`
- `AWAITING PROPOSAL`
- `PROPOSAL SENT`
- `MSA SIGNED`
- `INVOICE SENT`
- `LOST`
- `WON`

The Start Here form only sets the three intake statuses mapped above. Downstream statuses (`AWAITING PROPOSAL`, `PROPOSAL SENT`, `MSA SIGNED`, `INVOICE SENT`, `LOST`, `WON`) belong to later sales, MSA, invoice, win/loss, or manual pipeline actions and are not set by this form.

## Submitted Field Map

### Contact And Source

- `firstName`
  - **ClickUp field:** `First Name`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_FIRST_NAME`
  - **Type:** short text
  - **Required:** yes

- `lastName`
  - **ClickUp field:** `Last Name`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_LAST_NAME`
  - **Type:** short text
  - **Required:** yes

- `email`
  - **ClickUp field:** `Email`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_EMAIL`
  - **Type:** email / short text
  - **Required:** yes
  - **Matching:** do not dedupe fresh Start Here submissions by email. Use email as contact data only.

- `phone`
  - **ClickUp field:** `Phone`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_PHONE`
  - **Type:** short text
  - **Required:** yes

- `leadSource`
  - **ClickUp field:** `Lead Source`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_LEAD_SOURCE`
  - **Type:** text / long text
  - **Submitted value:** `Start Here Form` by default. If the public form URL includes a `source` query parameter, the submitted value is the query parameter value.
  - **QA submitted value:** `Test (Ignore)` for production-list integration tests only.

### Start Here Answer Storage

- `startHereAnswers`
  - **ClickUp field:** `Start Here Answers`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_START_HERE_ANSWERS`
  - **Type:** long text
  - **Submitted value:** stringified JSON with `schema: "redomiciled.start_here_answers.v1"` and an `answers` array.
  - **Contract:** each answer record has `key`, `label`, and `value`. Blank optional answers are included as empty strings to keep the shape stable.
  - **Replaces direct fields:** the form no longer writes separate answer-only custom fields such as `Lead Source Detail`, `Referral Detail`, `Trying To Solve`, `Current Residency`, `Monthly Revenue Band`, or `Important Routing Notes`.

Current JSON answer keys:

| Key                            | Label                            | Value shape                                                                                               |
| ------------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `leadSourceDetail`             | `Lead Source Detail`             | string option: `Community Member`, `Past Client`, `Warm Referral`, `Partner Referral`, `Cold Ad`, `Other` |
| `referralDetail`               | `Referral Detail`                | string                                                                                                    |
| `warmOverride`                 | `Warm Override`                  | boolean                                                                                                   |
| `consideringSpecificStructure` | `Considering Specific Structure` | string option                                                                                             |
| `tryingToSolve`                | `Trying To Solve`                | string array                                                                                              |
| `setupMaturity`                | `Setup Maturity`                 | string option                                                                                             |
| `currentResidence`             | `Current Residency`              | string                                                                                                    |
| `passportsCitizenships`        | `Passports / Citizenships`       | string                                                                                                    |
| `businessMainSourceOfIncome`   | `Business Main Source Of Income` | boolean                                                                                                   |
| `monthlyRevenueBand`           | `Monthly Revenue Band`           | string option; `Not applicable` when `businessMainSourceOfIncome` is false                                |
| `netWorthBand`                 | `Net Worth Band`                 | string option                                                                                             |
| `timelineToAct`                | `Timeline To Act`                | string option                                                                                             |
| `budgetReadiness`              | `Budget Readiness`               | string option                                                                                             |
| `importantRoutingNotes`        | `Important Routing Notes`        | string                                                                                                    |

### Prepared Outcome Fields

- `startHereFormRoute`
  - **ClickUp field:** `Start Here Form Route`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_START_HERE_FORM_ROUTE`
  - **Type:** dropdown
  - **Options:** `Unqualified / Not Ready`, `Booked Call`, `Manual Triage`

- `startHereFormRouteReason`
  - **ClickUp field:** `Start Here Form Route Reason`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_START_HERE_FORM_ROUTE_REASON`
  - **Type:** long text

- `routingDecisionSignals`
  - **ClickUp field:** `Routing Decision Signals`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_ROUTING_DECISION_SIGNALS`
  - **Type:** labels
  - **Options:** `Warm source`, `Known product/path`, `Complex / Guidance-led`, `Mixed / Unclear answers`, `No clear path`, `Low commercial signal`, `Urgent low commercial signal`, `Budget readiness rescue`

- `servicePath`
  - **ClickUp field:** `Service Path`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_SERVICE_PATH`
  - **Type:** dropdown
  - **Options:** `Banking`, `Bespoke plan`, `Other / manual review`, `Unknown`
  - **Prepared value:** `Banking` when `tryingToSolve` includes `New bank account`; otherwise `Bespoke plan` for booked-call leads, `Other / manual review` for manual-triage leads, and `Unknown` for unqualified leads.

- `bookedCallOwner`
  - **ClickUp field:** `Booked Call Owner`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_BOOKED_CALL_OWNER`
  - **Type:** People
  - **Prepared value:** `Will` for all booked-call outcomes under the temporary 2026-06-01 routing rule.
  - **ClickUp user IDs:** `Will` = `296457746`; `Erik` = `99702565`.

- `calComBookingId`
  - **ClickUp field:** `Cal.com Booking ID`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_CAL_COM_BOOKING_ID`
  - **Type:** short text
  - **Prepared value:** empty until Cal.com confirms a booking.

## Routing Scope

The form prepares the route preview in the browser, then posts the validated answers to the server route. Fresh Start Here submissions always create a new ClickUp Lead task, even when the same email has submitted before. Resubmission updates happen only when the client supplies the existing ClickUp task ID from the same submitted flow, such as after using "Review answers" and submitting again. It sets the native ClickUp intake status from the route mapping above, then writes submitted/prepared custom fields. A successful booked-call submission only shows the Cal.com embed after the ClickUp task is created or updated and a task ID is available for Cal.com metadata. The form still does not call webhooks, book Cal.com events, sync Brevo, or automate downstream funnel routing in this slice.
