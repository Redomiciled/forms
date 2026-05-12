# Start Here Form ClickUp Field Map

This repo-local map is limited to values the Start Here form collects or prepares at submission time. It intentionally excludes downstream funnel fields such as Brevo sync, MSA, payment, purchased service path, and recommendation call state.

## Integration Placeholders

- `CLICKUP_LIST_ID`: `PLACEHOLDER_CLICKUP_CRM_LIST_ID`
- `CLICKUP_FIELD_ID_FIRST_NAME`: `PLACEHOLDER_CLICKUP_FIELD_ID_FIRST_NAME`
- `CLICKUP_FIELD_ID_LAST_NAME`: `PLACEHOLDER_CLICKUP_FIELD_ID_LAST_NAME`
- `CLICKUP_FIELD_ID_EMAIL`: `PLACEHOLDER_CLICKUP_FIELD_ID_EMAIL`
- `CLICKUP_FIELD_ID_PHONE`: `PLACEHOLDER_CLICKUP_FIELD_ID_PHONE`
- `CLICKUP_FIELD_ID_LEAD_SOURCE`: `PLACEHOLDER_CLICKUP_FIELD_ID_LEAD_SOURCE`
- `CLICKUP_FIELD_ID_LEAD_SOURCE_DETAIL`: `PLACEHOLDER_CLICKUP_FIELD_ID_LEAD_SOURCE_DETAIL`
- `CLICKUP_FIELD_ID_REFERRAL_DETAIL`: `PLACEHOLDER_CLICKUP_FIELD_ID_REFERRAL_DETAIL`
- `CLICKUP_FIELD_ID_WARM_OVERRIDE`: `PLACEHOLDER_CLICKUP_FIELD_ID_WARM_OVERRIDE`
- `CLICKUP_FIELD_ID_CONSIDERING_SPECIFIC_STRUCTURE`: `PLACEHOLDER_CLICKUP_FIELD_ID_CONSIDERING_SPECIFIC_STRUCTURE`
- `CLICKUP_FIELD_ID_TRYING_TO_SOLVE`: `PLACEHOLDER_CLICKUP_FIELD_ID_TRYING_TO_SOLVE`
- `CLICKUP_FIELD_ID_SETUP_MATURITY`: `PLACEHOLDER_CLICKUP_FIELD_ID_SETUP_MATURITY`
- `CLICKUP_FIELD_ID_CURRENT_RESIDENCE`: `PLACEHOLDER_CLICKUP_FIELD_ID_CURRENT_RESIDENCE`
- `CLICKUP_FIELD_ID_PASSPORTS_CITIZENSHIPS`: `PLACEHOLDER_CLICKUP_FIELD_ID_PASSPORTS_CITIZENSHIPS`
- `CLICKUP_FIELD_ID_BUSINESS_MAIN_SOURCE_OF_INCOME`: `PLACEHOLDER_CLICKUP_FIELD_ID_BUSINESS_MAIN_SOURCE_OF_INCOME`
- `CLICKUP_FIELD_ID_MONTHLY_REVENUE_BAND`: `PLACEHOLDER_CLICKUP_FIELD_ID_MONTHLY_REVENUE_BAND`
- `CLICKUP_FIELD_ID_NET_WORTH_BAND`: `PLACEHOLDER_CLICKUP_FIELD_ID_NET_WORTH_BAND`
- `CLICKUP_FIELD_ID_TIMELINE_TO_ACT`: `PLACEHOLDER_CLICKUP_FIELD_ID_TIMELINE_TO_ACT`
- `CLICKUP_FIELD_ID_BUDGET_READINESS`: `PLACEHOLDER_CLICKUP_FIELD_ID_BUDGET_READINESS`
- `CLICKUP_FIELD_ID_IMPORTANT_ROUTING_NOTES`: `PLACEHOLDER_CLICKUP_FIELD_ID_IMPORTANT_ROUTING_NOTES`
- `CLICKUP_FIELD_ID_START_HERE_FORM_ROUTE`: `PLACEHOLDER_CLICKUP_FIELD_ID_START_HERE_FORM_ROUTE`
- `CLICKUP_FIELD_ID_START_HERE_FORM_ROUTE_REASON`: `PLACEHOLDER_CLICKUP_FIELD_ID_START_HERE_FORM_ROUTE_REASON`
- `CLICKUP_FIELD_ID_ROUTING_DECISION_SIGNALS`: `PLACEHOLDER_CLICKUP_FIELD_ID_ROUTING_DECISION_SIGNALS`
- `CLICKUP_FIELD_ID_BOOKED_CALL_OWNER`: `PLACEHOLDER_CLICKUP_FIELD_ID_BOOKED_CALL_OWNER`
- `CLICKUP_FIELD_ID_CAL_COM_BOOKING_ID`: `PLACEHOLDER_CLICKUP_FIELD_ID_CAL_COM_BOOKING_ID`
- `CAL_COM_OWNER_ERIK_URL`: `PLACEHOLDER_CAL_COM_ERIK_URL`
- `CAL_COM_OWNER_WILL_URL`: `PLACEHOLDER_CAL_COM_WILL_URL`

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
  - **Matching:** use as the primary create/update key.

- `phone`
  - **ClickUp field:** `Phone`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_PHONE`
  - **Type:** short text
  - **Required:** yes

- `leadSource`
  - **ClickUp field:** `Lead Source`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_LEAD_SOURCE`
  - **Type:** dropdown
  - **Submitted value:** `Start Here Form`

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
  - **ClickUp field:** `Current Residence`
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

- `bookedCallOwner`
  - **ClickUp field:** `Booked Call Owner`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_BOOKED_CALL_OWNER`
  - **Type:** People
  - **Prepared value:** `Will` for banking-led booked-call outcomes; `Erik` for all other booked-call outcomes.
  - **Placeholder:** actual ClickUp user IDs are not known yet.

- `calComBookingId`
  - **ClickUp field:** `Cal.com Booking ID`
  - **ClickUp field ID:** `CLICKUP_FIELD_ID_CAL_COM_BOOKING_ID`
  - **Type:** short text
  - **Prepared value:** empty until Cal.com confirms a booking.

## Routing Scope

The form may prepare a local route preview and payload for review. It must not create ClickUp records, call webhooks, book Cal.com events, sync Brevo, or automate downstream funnel routing in this slice.
