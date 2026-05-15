# Redomiciled Start Here Form + Routing Logic Checklist

Source: [Redomiciled_Start_Here_Form_Spec.docx](./Redomiciled_Start_Here_Form_Spec.docx)

This checklist tracks source coverage from the original DOCX. Checked boxes mean the source item has been captured here for implementation tracking. The `Implementation` line records current product status.

## Goal

- [x] The Start Here form is the single entry point for anyone interested in Redomiciled services.
  - **Implementation:** Implemented as the root form experience.

- [x] It has two jobs:
  - **Implementation:** Implemented for in-app intake, routing, ClickUp persistence, and Cal.com embed routing.

- [x] Route serious leads to the right next step.
  - **Implementation:** Implemented in `deriveStartHereRoute(values)` with booked-call, manual-triage, and unqualified outcomes.

- [x] Protect Eric and Will from low-fit calls.
  - **Implementation:** Implemented with `Unqualified / Not Ready` and `Manual Triage` routes before calendar display.

- [x] This is not an onboarding form.
  - **Implementation:** Implemented. Current questions stay at routing/intake level.

- [x] It only asks enough to decide what should happen next.
  - **Implementation:** Implemented, with one operator override: visible source selector was removed from Step 1.

## Form Questions

### 1. Contact details

- [x] Capture the lead first so Redomiciled can follow up even if they abandon later.
  - **Implementation:** Implemented locally in Step 1. Abandon capture itself is downstream/out of scope until persistence/webhook exists.

- [x] Name
  - **Implementation:** Implemented as first name and last name fields.

- [x] Email
  - **Implementation:** Implemented and validated with Zod.

- [x] WhatsApp / phone
  - **Implementation:** Implemented as `Phone` per operator override.

- [x] Who referred you? (optional)
  - **Implementation:** Implemented.

### 2. Are you considering a specific structure, bank account, or jurisdiction?

- [x] Yes — I know what structure I want, or I know I need a bank account
  - **Implementation:** Implemented with source wording.

- [x] No — I want help finding the right path
  - **Implementation:** Implemented with source wording.

- [x] I just want to check my current structure is compliant
  - **Implementation:** Implemented with source wording.

### 3. What are you trying to solve? (select all that apply)

- [x] Relocate my individual tax residency
  - **Implementation:** Implemented with source wording.

- [x] Set up a new entity that suits me better
  - **Implementation:** Implemented with source wording.

- [x] Get a second passport
  - **Implementation:** Implemented with source wording.

- [x] New bank account
  - **Implementation:** Implemented with source wording.

- [x] Help with a crypto transaction
  - **Implementation:** Implemented with source wording.

- [x] Check if my current structure is compliant
  - **Implementation:** Implemented with source wording.

- [x] Diversify my assets globally without changing where I live
  - **Implementation:** Implemented with source wording.

### 4. How would you describe where you're at today?

- [x] New to this — first time moving abroad / first experience with the offshore world
  - **Implementation:** Implemented with source wording.

- [x] Partially set up — I have some international structure but want to improve it
  - **Implementation:** Implemented with source wording.

- [x] Sophisticated setup — I have established structures and need specific expert help
  - **Implementation:** Implemented with source wording.

### 5. Where are you currently a resident?

- [x] Free text
  - **Implementation:** Implemented.

### 6. What passport(s) / citizenship(s) do you hold?

- [x] Free text
  - **Implementation:** Implemented.

### 7. Is your business your main source of income?

- [x] Yes
  - **Implementation:** Implemented.

- [x] No
  - **Implementation:** Implemented.

- [x] If Yes, ask the conditional revenue question below.
  - **Implementation:** Implemented.

- [x] If No, skip it.
  - **Implementation:** Implemented.

### 7a. (Conditional, only if Yes) What is your approximate monthly revenue?

- [x] $0–$5k / month
  - **Implementation:** Implemented with source wording.

- [x] $5k–$25k / month
  - **Implementation:** Implemented with source wording.

- [x] $25k–$100k / month
  - **Implementation:** Implemented with source wording.

- [x] $100k–$1M / month
  - **Implementation:** Implemented with source wording.

- [x] $1M+ / month
  - **Implementation:** Implemented with source wording.

- [x] Note: Leads who say their business is not their main source of income will not be routed to business-structure recommendations.
  - **Implementation:** Implemented in routing commercial-signal checks.

### 8. What is your current net worth? (USD, all assets)

- [x] $0–$50k
  - **Implementation:** Implemented with source wording.

- [x] $50k–$250k
  - **Implementation:** Implemented with source wording.

- [x] $250k–$1M
  - **Implementation:** Implemented with source wording.

- [x] $1M–$5M
  - **Implementation:** Implemented with source wording.

- [x] $5M–$20M
  - **Implementation:** Implemented with source wording.

- [x] $20M+
  - **Implementation:** Implemented with source wording.

### 9. How soon are you looking to act?

- [x] ASAP / 0–3 months
  - **Implementation:** Implemented with source wording.

- [x] 3–6 months
  - **Implementation:** Implemented with source wording.

- [x] 6+ months
  - **Implementation:** Implemented with source wording.

- [x] Just exploring
  - **Implementation:** Implemented with source wording.

### 10. Budget readiness

- [x] Asked of every lead.
  - **Implementation:** Implemented.

- [x] Recommended copy: “Most Redomiciled engagements require a minimum initial investment of €1,500. If we confirm we’re the right fit, are you ready to invest at that level?”
  - **Implementation:** Implemented with source wording.

- [x] Yes
  - **Implementation:** Implemented.

- [x] Maybe, if the fit is clear
  - **Implementation:** Implemented.

- [x] No
  - **Implementation:** Implemented.

- [x] Note: If they answer No here, the disqualification screen tells them why so they can re-submit later if their situation changes.
  - **Implementation:** Implemented for `Unqualified / Not Ready` final screen.

### 11. Anything important we should know before routing you?

- [x] Optional free text.
  - **Implementation:** Implemented.

- [x] Catch-all for context that didn’t fit anywhere else — without turning the first form into legal/tax diligence.
  - **Implementation:** Implemented as optional notes.

### 12. Calendar booking (only shown if the lead qualifies)

- [x] If the form outcome is booked call, the last step shows the right Cal.com calendar.
  - **Implementation:** Implemented with real Will/Erik Cal.com event links.

- [x] Default owner routing:
  - **Implementation:** Implemented in the routing engine.

- [x] Banking → Will’s calendar
  - **Implementation:** Implemented with Will owner and Cal.com embed-ready display.

- [x] Everything else → Eric’s calendar
  - **Implementation:** Implemented with Erik owner and Cal.com embed-ready display for booked-call non-banking routes.

## Outcomes

- [x] Every form submission ends in exactly one of:
  - **Implementation:** Implemented by `deriveStartHereRoute(values)`.

- [x] Unqualified / not ready — sent back to the free community or nurture.
  - **Implementation:** Implemented with final screen copy and no calendar.

- [x] Booked call — routed to a sales / product / warm consult call.
  - **Implementation:** Implemented with Will/Erik owner routing and route-specific Cal.com embed-ready final screen.

- [x] Manual triage — sent to internal review when the form indicates possible value but unclear route.
  - **Implementation:** Implemented in `deriveStartHereRoute(values)` and final screen copy.

- [x] The form should create or update the ClickUp deal once, after submission, with the final route and reason.
  - **Implementation:** Pending downstream integration. Current app prepares local payload only.

- [x] If the outcome is booked call, the form shows the calendar as the final step.
  - **Implementation:** Implemented as a route-specific Cal.com inline embed using Will's calendar for banking and Erik's calendar for other booked calls.

- [x] Otherwise, no calendar is shown.
  - **Implementation:** Implemented for `Manual Triage` and `Unqualified / Not Ready`.

## Routing Logic

### Principle

- [x] Monthly revenue should not be the only qualification signal.
  - **Implementation:** Implemented. Routing combines revenue, business-main-income, net worth, intent, urgency, budget readiness, and source quality.

- [x] The strongest fit signals are:
  - **Implementation:** Implemented as route helper signals in `src/lib/start-here-routing.ts`.

- [x] Source quality (warm intro, partner referral, cold)
  - **Implementation:** Partial. Visible source selector was removed; referral text currently sets a `Warm Referral` prepared signal when present. Cold/source quality needs a non-visible acquisition source or URL/CRM source strategy.

- [x] Specific product / path intent
  - **Implementation:** Implemented with `hasSpecificProductPath(values)`.

- [x] Urgency
  - **Implementation:** Implemented with timeline checks and urgent-route tests.

- [x] Business revenue (where applicable) and net worth
  - **Implementation:** Implemented with commercial helper functions.

- [x] Willingness to invest at the minimum professional fee level
  - **Implementation:** Implemented in low-commercial/low-urgency routing.

- [x] [NEEDS REVIEW] The thresholds in the original spec ($10k/month, $25k/month) were written when revenue was the only commercial signal.
  - **Implementation:** Implemented using the written thresholds. Bands that contain or exceed the threshold count as meeting it.

- [x] The form now splits commercial signal across (a) whether the business is the main source of income, (b) monthly revenue if so, and (c) net worth.
  - **Implementation:** Implemented in commercial helper functions.

- [x] The rules below keep the original structure but the specific threshold numbers need Eric/Will sign-off before we ship.
  - **Implementation:** Implemented using the written rules so admin previews can exercise every outcome; still worth client review before production launch.

### Warm leads

- [x] Warm leads should not be auto-disqualified.
  - **Implementation:** Implemented and covered by routing unit test.

- [x] If warm_override = true OR source = warm_referral OR source = partner_referral, do not auto-disqualify; route to a free light consult or to manual triage.
  - **Implementation:** Implemented. Current short-term source rule treats a filled referral field as `Warm Referral`.

- [x] Relationship context can matter more than the form answers.
  - **Implementation:** Implemented by evaluating warm lead priority before disqualification rules.

### Clear product intent

- [x] Known-product leads usually get a product sales call unless there is an obvious no-fit.
  - **Implementation:** Implemented.

- [x] If a specific product/path is selected AND (business is main income with revenue ≥ $10k/month OR net worth ≥ $1M) → route to product sales call; show calendar based on owner map.
  - **Implementation:** Implemented. `$5k–$25k / month` counts as meeting the written `$10k/month` threshold because the band contains the threshold.

- [x] If a specific product/path is selected AND commercial signal is below the bar AND timeline is ASAP / 0–3 months → route to product sales call or manual triage; show calendar only if product sales call is selected.
  - **Implementation:** Implemented as `Booked Call` when the path is clear and urgent.

- [x] [NEEDS REVIEW] Confirm: should the ‘commercial signal’ bar be revenue ≥ $10k/month OR net worth ≥ $1M, or something else?
  - **Implementation:** Implemented as written: revenue ≥ `$10k/month` OR net worth ≥ `$1M`.

- [x] The original used revenue alone.
  - **Implementation:** Captured as review context.

### Complex / guidance-led intent

- [x] People who need diagnosis go to a sales call before any paid consult is sold.
  - **Implementation:** Implemented for complex/guidance-led leads with commercial fit.

- [x] If path is Bespoke / Banking / Not sure / multiple complex areas AND (revenue ≥ $25k/month OR net worth ≥ $1M) → route to sales call; show calendar based on owner map.
  - **Implementation:** Implemented with current form mapping: guidance-led answer, compliance answer, or more than two selected problem areas.

- [x] If revenue ≥ $50k/month OR net worth ≥ $5M AND answers are mixed/unclear → route to manual triage or senior sales call.
  - **Implementation:** Implemented as `Manual Triage`. `$25k–$100k / month` counts as meeting the written `$50k/month` threshold because the band contains the threshold.

- [x] [NEEDS REVIEW] Confirm: is the complex-guidance bar the right level given net worth is now a separate signal?
  - **Implementation:** Implemented as written: revenue ≥ `$25k/month` OR net worth ≥ `$1M`.

### Low commercial signal + low urgency (the main disqualification case)

- [x] If revenue < $10k/month (or business is not main income) AND net worth < $250k AND timeline is 6+ months OR just exploring → use the budget readiness answer to decide:
  - **Implementation:** Implemented with explicit parentheses: `(revenue < $10k/month OR business is not main income) AND net worth < $250k AND (timeline is 6+ months OR just exploring)`.

- [x] Budget readiness = Yes → allow through; route to product sales call or manual triage based on clarity.
  - **Implementation:** Implemented.

- [x] Budget readiness = Maybe → manual triage or nurture.
  - **Implementation:** Implemented as `Manual Triage` until nurture automation exists.

- [x] Budget readiness = No → disqualify to free community / nurture.
  - **Implementation:** Implemented as `Unqualified / Not Ready`.

- [x] [NEEDS REVIEW] Confirm: should net worth < $250k be the right secondary cutoff?
  - **Implementation:** Implemented as written.

### Low commercial signal but urgent

- [x] Don’t hard-disqualify urgent leads solely because their revenue or net worth is low.
  - **Implementation:** Implemented and covered by routing unit test.

- [x] If revenue < $10k/month AND net worth < $250k AND timeline = ASAP / 0–3 months → route based on product/path clarity.
  - **Implementation:** Implemented.

- [x] Urgency plus specific intent can still make the call worthwhile.
  - **Implementation:** Implemented as `Booked Call` for clear urgent product/path intent.

### No clear path and low commercial fit

- [x] If no clear product/path AND revenue < $25k/month AND net worth < $1M AND budget readiness is not Yes → disqualify to free community / nurture.
  - **Implementation:** Implemented and covered by routing unit test.

## Disqualification Screen

- [x] Recommended copy:
  - **Implementation:** Implemented on the `Unqualified / Not Ready` final screen.

- [x] “Based on your answers, the best next step is to keep using the free Redomiciled community for now. If your situation changes, or if you’re ready to invest at least €1,500 in professional support, you can submit again and we’ll route you to the right next step.”
  - **Implementation:** Implemented with exact copy.

## Precise Routing Implementation Steps

### Step 1 - Add a pure routing function

- [x] Create `deriveStartHereRoute(values)` in `src/lib/start-here.ts` or a dedicated `src/lib/start-here-routing.ts`.
  - **Implementation:** Implemented in `src/lib/start-here-routing.ts`. `prepareStartHereSubmission(values)` now consumes the route result instead of hardcoding `Manual Triage`.

### Step 2 - Normalize commercial signals

- [x] Create helpers for `businessIsMainIncome`, `revenueAtLeast10k`, `revenueAtLeast25k`, `revenueAtLeast50k`, `netWorthAtLeast250k`, `netWorthAtLeast1M`, and `netWorthAtLeast5M`.
  - **Implementation:** Implemented commercial helpers in `src/lib/start-here-routing.ts`. Per operator direction, rules that need review still go forward using the written thresholds: bands that contain or exceed a threshold count as meeting it.

### Step 3 - Normalize intent signals

- [x] Create helpers for `hasSpecificProductPath`, `hasBankingIntent`, `hasGuidanceLedIntent`, `hasComplexIntent`, and `hasNoClearPath`.
  - **Implementation:** Implemented in `src/lib/start-here-routing.ts` with this current form mapping:
    - `hasBankingIntent`: `tryingToSolve` includes `New bank account`.
    - `hasSpecificProductPath`: specific-structure answer is `Yes — I know what structure I want, or I know I need a bank account` OR selected problems include `New bank account`, `Get a second passport`, or `Help with a crypto transaction`.
    - `hasGuidanceLedIntent`: specific-structure answer is `No — I want help finding the right path`.
    - `hasComplexIntent`: multiple complex areas selected OR guidance-led answer OR compliance/current-structure answer.
    - `hasNoClearPath`: no specific product/path and not enough intent clarity for booked call.

### Step 4 - Normalize source quality

- [x] Decide where source quality comes from now that the visible source selector is removed.
  - **Implementation:** Implemented the short-term app assumption: non-empty referral detail sets `warm_override = true` and `leadSourceDetail = Warm Referral`. Longer-term acquisition/source strategy remains an integration concern.

### Step 5 - Apply warm lead priority first

- [x] If `warm_override = true OR source = warm_referral OR source = partner_referral`, never return `Unqualified / Not Ready`.
  - **Implementation:** Implemented. If the lead otherwise lacks clarity or commercial signal, return `Manual Triage`; if the lead has a clear booked-call path, return `Booked Call`.

### Step 6 - Apply clear product intent rules

- [x] If a specific product/path is selected AND (business is main income with revenue ≥ $10k/month OR net worth ≥ $1M), route to `Booked Call`.
  - **Implementation:** Implemented. Calendar owner is Will for banking; Erik for everything else.

- [x] If a specific product/path is selected AND commercial signal is below the bar AND timeline is ASAP / 0–3 months, route to either `Booked Call` or `Manual Triage`.
  - **Implementation:** Implemented as `Booked Call` when product/path is clear and urgent.

### Step 7 - Apply complex / guidance-led intent rules

- [x] If path is Bespoke / Banking / Not sure / multiple complex areas AND (revenue ≥ $25k/month OR net worth ≥ $1M), route to `Booked Call`.
  - **Implementation:** Implemented. Calendar owner is Will for banking; Erik for everything else.

- [x] If revenue ≥ $50k/month OR net worth ≥ $5M AND answers are mixed/unclear, route to `Manual Triage`.
  - **Implementation:** Implemented as `Manual Triage` rather than senior sales call until the app has a senior-sales owner/calendar.

### Step 8 - Apply low commercial signal + low urgency rules

- [x] If revenue < $10k/month (or business is not main income) AND net worth < $250k AND timeline is 6+ months OR just exploring, route by budget readiness.
  - **Implementation:** Implemented with explicit parentheses in code.

- [x] Budget readiness = Yes → allow through; route to product sales call or manual triage based on clarity.
  - **Implementation:** Implemented. Return `Booked Call` only if path/owner is clear; otherwise `Manual Triage`.

- [x] Budget readiness = Maybe → manual triage or nurture.
  - **Implementation:** Implemented as `Manual Triage` until nurture automation exists.

- [x] Budget readiness = No → disqualify to free community / nurture.
  - **Implementation:** Implemented as `Unqualified / Not Ready` with the disqualification screen copy.

### Step 9 - Apply low commercial signal but urgent rules

- [x] If revenue < $10k/month AND net worth < $250k AND timeline = ASAP / 0–3 months, route based on product/path clarity.
  - **Implementation:** Implemented. Return `Booked Call` for clear path, otherwise `Manual Triage`; do not hard-disqualify solely on low commercial signal.

### Step 10 - Apply no clear path and low commercial fit rule

- [x] If no clear product/path AND revenue < $25k/month AND net worth < $1M AND budget readiness is not Yes, return `Unqualified / Not Ready`.
  - **Implementation:** Implemented.

### Step 11 - Add route-specific final screens

- [x] Show calendar only for `Booked Call`.
  - **Implementation:** Implemented. Will calendar for banking; Erik calendar for everything else.

- [x] Show disqualification copy only for `Unqualified / Not Ready`.
  - **Implementation:** Implemented with the exact recommended copy from the source spec.

- [x] Show internal-review confirmation for `Manual Triage`.
  - **Implementation:** Implemented. No calendar.

### Step 12 - Add admin preview presets

- [x] Add admin mode and route presets after routing is implemented.
  - **Implementation:** Implemented. Presets cover `Booked Call - banking`, `Booked Call - non-banking`, `Manual Triage`, `Unqualified`, and `Warm referral`.

## Questions / Decisions Needed

### Q1 - Resolved for v1

> How should revenue bands that cross thresholds be treated, especially `$5k–$25k / month` for `$10k/month` and `$25k–$100k / month` for `$50k/month`?

- **Implementation:** Per operator direction, use the written rules. Bands that contain or exceed a threshold count as meeting it.

### Q2 - Resolved for v1

> Where should source quality come from now that the visible source selector was removed?

- **Implementation:** Use `Who referred you?` as warm override when filled, and keep acquisition/source as a future integration input.

### Q3 - Resolved for v1

> Should complex-guidance qualified leads go to the same booked-call calendar as product sales, or should there be a separate senior-sales/manual-triage owner?

- **Implementation:** Use `Manual Triage` for unclear senior-sales cases.
