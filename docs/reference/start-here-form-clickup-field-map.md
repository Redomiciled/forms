# Start Here Form ClickUp Field Map

This repo-local map is limited to values the Start Here form collects or prepares at submission time. It intentionally excludes downstream funnel fields such as Brevo sync, MSA, payment, and recommendation call state. Keep it in sync with the live client-level field map when ClickUp schema IDs or options change.

## Integration Placeholders

- `CLICKUP_LIST_ID`: `901217458864`
- `CLICKUP_LEAD_TASK_TYPE_ID`: `1001`
- `CLICKUP_FIELD_ID_FIRST_NAME`: `b6b2590d-58a3-463b-8e38-691c791e0f7f`
- `CLICKUP_FIELD_ID_LAST_NAME`: `c63b5e5a-220f-49f2-8b0f-1da4137139d1`
- `CLICKUP_FIELD_ID_EMAIL`: `cfe207d1-c5a3-47b7-bd72-eae0d5c0c708`
- `CLICKUP_FIELD_ID_PHONE`: `3a356107-fadc-41c2-90fd-46b4af007fdf`
- `CLICKUP_FIELD_ID_LEAD_SOURCE`: `f4b729b2-a300-4bb0-a465-08c51e7ad441`
- `CLICKUP_FIELD_ID_LEAD_SOURCE_DETAIL`: `428ab3fa-d1de-464b-b4d5-4785a51012d0`
- `CLICKUP_FIELD_ID_REFERRAL_DETAIL`: `9eabae2e-f35e-40ab-8284-05526f4e223c`
- `CLICKUP_FIELD_ID_WARM_OVERRIDE`: `2b9bb488-1791-40cf-9f51-9cc1883de459`
- `CLICKUP_FIELD_ID_CONSIDERING_SPECIFIC_STRUCTURE`: `11af648c-f959-4155-a431-19b173c2f43c`
- `CLICKUP_FIELD_ID_TRYING_TO_SOLVE`: `f84cb55a-383d-4e72-9423-f17321324b1c`
- `CLICKUP_FIELD_ID_SETUP_MATURITY`: `bbf53e18-3edc-428c-97f7-e30af56da120`
- `CLICKUP_FIELD_ID_CURRENT_RESIDENCE`: `793483e6-ff19-4d4b-ac56-d36cc0cb2ec0`
- `CLICKUP_FIELD_ID_PASSPORTS_CITIZENSHIPS`: `af5c8a0b-acbf-4ed7-a0ae-b9d1c2ec8dde`
- `CLICKUP_FIELD_ID_BUSINESS_MAIN_SOURCE_OF_INCOME`: `c41d84b5-6db8-4d04-b8e5-d88396e5b5d3`
- `CLICKUP_FIELD_ID_MONTHLY_REVENUE_BAND`: `42ae346a-bd16-47a9-bb06-b4a50ace0e2c`
- `CLICKUP_FIELD_ID_NET_WORTH_BAND`: `57525f9d-ec68-423a-a4c8-3207c778e5ae`
- `CLICKUP_FIELD_ID_TIMELINE_TO_ACT`: `a06451f1-e78d-46e7-aa53-826c54628f1a`
- `CLICKUP_FIELD_ID_BUDGET_READINESS`: `c0107b5f-5049-4613-a588-2cc4ca62e997`
- `CLICKUP_FIELD_ID_IMPORTANT_ROUTING_NOTES`: `e54df295-82b9-43e0-b6ef-daee240eef04`
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
  - **Type:** dropdown
  - **Submitted value:** `Start Here Form` by default, or `Landing Page` when the public form URL includes `source=landing_page`.
  - **QA submitted value:** `Test (Ignore)` for production-list integration tests only.

- `leadSourceDetail`
  - **ClickUp field:** `Lead Source Detail`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_LEAD_SOURCE_DETAIL`
  - **Type:** dropdown
  - **Options:** `Community Member`, `Past Client`, `Warm Referral`, `Partner Referral`, `Cold Ad`, `Other`
  - **Required:** yes

- `referralDetail`
  - **ClickUp field:** `Referral Detail`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_REFERRAL_DETAIL`
  - **Type:** short text
  - **Required:** no

- `warmOverride`
  - **ClickUp field:** `Warm Override`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_WARM_OVERRIDE`
  - **Type:** checkbox
  - **Prepared value:** true when source detail is `Past Client`, `Warm Referral`, or `Partner Referral`.

### Start Here Questions

- `consideringSpecificStructure`
  - **ClickUp field:** `Considering Specific Structure`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_CONSIDERING_SPECIFIC_STRUCTURE`
  - **Type:** dropdown
  - **Options:** `Yes - knows structure or bank need`, `No - needs path guidance`, `Compliance check`

- `tryingToSolve`
  - **ClickUp field:** `Trying To Solve`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_TRYING_TO_SOLVE`
  - **Type:** labels
  - **Options:** `Relocate tax residency`, `New entity`, `Second passport`, `New bank account`, `Crypto transaction`, `Structure compliance check`, `Diversify assets without moving`

- `setupMaturity`
  - **ClickUp field:** `Setup Maturity`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_SETUP_MATURITY`
  - **Type:** dropdown
  - **Options:** `New to this`, `Partially set up`, `Sophisticated setup`

- `currentResidence`
  - **ClickUp field:** `Current Residency`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_CURRENT_RESIDENCE`
  - **Type:** short text

- `passportsCitizenships`
  - **ClickUp field:** `Passports / Citizenships`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_PASSPORTS_CITIZENSHIPS`
  - **Type:** long text

- `businessMainSourceOfIncome`
  - **ClickUp field:** `Business Main Source Of Income`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_BUSINESS_MAIN_SOURCE_OF_INCOME`
  - **Type:** checkbox

- `monthlyRevenueBand`
  - **ClickUp field:** `Monthly Revenue Band`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_MONTHLY_REVENUE_BAND`
  - **Type:** dropdown
  - **Options:** `$0-$5k/month`, `$5k-$25k/month`, `$25k-$100k/month`, `$100k-$1M/month`, `$1M+/month`, `Not applicable`
  - **Prepared value:** `Not applicable` when `businessMainSourceOfIncome` is false.

- `netWorthBand`
  - **ClickUp field:** `Net Worth Band`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_NET_WORTH_BAND`
  - **Type:** dropdown
  - **Options:** `$0-$50k`, `$50k-$250k`, `$250k-$1M`, `$1M-$5M`, `$5M-$20M`, `$20M+`

- `timelineToAct`
  - **ClickUp field:** `Timeline To Act`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_TIMELINE_TO_ACT`
  - **Type:** dropdown
  - **Options:** `ASAP / 0-3 months`, `3-6 months`, `6+ months`, `Just exploring`

- `budgetReadiness`
  - **ClickUp field:** `Budget Readiness`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_BUDGET_READINESS`
  - **Type:** dropdown
  - **Options:** `Yes`, `Maybe, if the fit is clear`, `No`
  - **Displayed copy:** `Most Redomiciled engagements require a minimum initial investment of EUR 1,500. If we confirm we're the right fit, are you ready to invest at that level?`

- `importantRoutingNotes`
  - **ClickUp field:** `Important Routing Notes`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_IMPORTANT_ROUTING_NOTES`
  - **Type:** long text
  - **Required:** no

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
