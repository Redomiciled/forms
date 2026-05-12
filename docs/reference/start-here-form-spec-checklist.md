# Redomiciled Start Here Form + Routing Logic Checklist

Source: [Redomiciled_Start_Here_Form_Spec.docx](./Redomiciled_Start_Here_Form_Spec.docx)

## Goal

- [ ] The Start Here form is the single entry point for anyone interested in Redomiciled services.
  - **Implementation:**

- [ ] It has two jobs:
  - **Implementation:**

- [ ] Route serious leads to the right next step.
  - **Implementation:**

- [ ] Protect Eric and Will from low-fit calls.
  - **Implementation:**

- [ ] This is not an onboarding form.
  - **Implementation:**

- [ ] It only asks enough to decide what should happen next.
  - **Implementation:**

## Form Questions

### 1. Contact details

- [ ] Capture the lead first so Redomiciled can follow up even if they abandon later.
  - **Implementation:**

- [ ] Name
  - **Implementation:**

- [ ] Email
  - **Implementation:**

- [ ] WhatsApp / phone
  - **Implementation:**

- [ ] Who referred you? (optional)
  - **Implementation:**

### 2. Are you considering a specific structure, bank account, or jurisdiction?

- [ ] Yes — I know what structure I want, or I know I need a bank account
  - **Implementation:**

- [ ] No — I want help finding the right path
  - **Implementation:**

- [ ] I just want to check my current structure is compliant
  - **Implementation:**

### 3. What are you trying to solve? (select all that apply)

- [ ] Relocate my individual tax residency
  - **Implementation:**

- [ ] Set up a new entity that suits me better
  - **Implementation:**

- [ ] Get a second passport
  - **Implementation:**

- [ ] New bank account
  - **Implementation:**

- [ ] Help with a crypto transaction
  - **Implementation:**

- [ ] Check if my current structure is compliant
  - **Implementation:**

- [ ] Diversify my assets globally without changing where I live
  - **Implementation:**

### 4. How would you describe where you're at today?

- [ ] New to this — first time moving abroad / first experience with the offshore world
  - **Implementation:**

- [ ] Partially set up — I have some international structure but want to improve it
  - **Implementation:**

- [ ] Sophisticated setup — I have established structures and need specific expert help
  - **Implementation:**

### 5. Where are you currently a resident?

- [ ] Free text
  - **Implementation:**

### 6. What passport(s) / citizenship(s) do you hold?

- [ ] Free text
  - **Implementation:**

### 7. Is your business your main source of income?

- [ ] Yes
  - **Implementation:**

- [ ] No
  - **Implementation:**

- [ ] If Yes, ask the conditional revenue question below.
  - **Implementation:**

- [ ] If No, skip it.
  - **Implementation:**

### 7a. (Conditional, only if Yes) What is your approximate monthly revenue?

- [ ] $0–$5k / month
  - **Implementation:**

- [ ] $5k–$25k / month
  - **Implementation:**

- [ ] $25k–$100k / month
  - **Implementation:**

- [ ] $100k–$1M / month
  - **Implementation:**

- [ ] $1M+ / month
  - **Implementation:**

- [ ] Note: Leads who say their business is not their main source of income will not be routed to business-structure recommendations.
  - **Implementation:**

### 8. What is your current net worth? (USD, all assets)

- [ ] $0–$50k
  - **Implementation:**

- [ ] $50k–$250k
  - **Implementation:**

- [ ] $250k–$1M
  - **Implementation:**

- [ ] $1M–$5M
  - **Implementation:**

- [ ] $5M–$20M
  - **Implementation:**

- [ ] $20M+
  - **Implementation:**

### 9. How soon are you looking to act?

- [ ] ASAP / 0–3 months
  - **Implementation:**

- [ ] 3–6 months
  - **Implementation:**

- [ ] 6+ months
  - **Implementation:**

- [ ] Just exploring
  - **Implementation:**

### 10. Budget readiness

- [ ] Asked of every lead.
  - **Implementation:**

- [ ] Recommended copy: “Most Redomiciled engagements require a minimum initial investment of €1,500. If we confirm we’re the right fit, are you ready to invest at that level?”
  - **Implementation:**

- [ ] Yes
  - **Implementation:**

- [ ] Maybe, if the fit is clear
  - **Implementation:**

- [ ] No
  - **Implementation:**

- [ ] Note: If they answer No here, the disqualification screen tells them why so they can re-submit later if their situation changes.
  - **Implementation:**

### 11. Anything important we should know before routing you?

- [ ] Optional free text.
  - **Implementation:**

- [ ] Catch-all for context that didn’t fit anywhere else — without turning the first form into legal/tax diligence.
  - **Implementation:**

### 12. Calendar booking (only shown if the lead qualifies)

- [ ] If the form outcome is booked call, the last step shows the right Cal.com calendar.
  - **Implementation:**

- [ ] Default owner routing:
  - **Implementation:**

- [ ] Banking → Will’s calendar
  - **Implementation:**

- [ ] Everything else → Eric’s calendar
  - **Implementation:**

## Outcomes

- [ ] Every form submission ends in exactly one of:
  - **Implementation:**

- [ ] Unqualified / not ready — sent back to the free community or nurture.
  - **Implementation:**

- [ ] Booked call — routed to a sales / product / warm consult call.
  - **Implementation:**

- [ ] Manual triage — sent to internal review when the form indicates possible value but unclear route.
  - **Implementation:**

- [ ] The form should create or update the ClickUp deal once, after submission, with the final route and reason.
  - **Implementation:**

- [ ] If the outcome is booked call, the form shows the calendar as the final step.
  - **Implementation:**

- [ ] Otherwise, no calendar is shown.
  - **Implementation:**

## Routing Logic

### Principle

- [ ] Monthly revenue should not be the only qualification signal.
  - **Implementation:**

- [ ] The strongest fit signals are:
  - **Implementation:**

- [ ] Source quality (warm intro, partner referral, cold)
  - **Implementation:**

- [ ] Specific product / path intent
  - **Implementation:**

- [ ] Urgency
  - **Implementation:**

- [ ] Business revenue (where applicable) and net worth
  - **Implementation:**

- [ ] Willingness to invest at the minimum professional fee level
  - **Implementation:**

- [ ] [NEEDS REVIEW] The thresholds in the original spec ($10k/month, $25k/month) were written when revenue was the only commercial signal.
  - **Implementation:**

- [ ] The form now splits commercial signal across (a) whether the business is the main source of income, (b) monthly revenue if so, and (c) net worth.
  - **Implementation:**

- [ ] The rules below keep the original structure but the specific threshold numbers need Eric/Will sign-off before we ship.
  - **Implementation:**

### Warm leads

- [ ] Warm leads should not be auto-disqualified.
  - **Implementation:**

- [ ] If warm_override = true OR source = warm_referral OR source = partner_referral, do not auto-disqualify; route to a free light consult or to manual triage.
  - **Implementation:**

- [ ] Relationship context can matter more than the form answers.
  - **Implementation:**

### Clear product intent

- [ ] Known-product leads usually get a product sales call unless there is an obvious no-fit.
  - **Implementation:**

- [ ] If a specific product/path is selected AND (business is main income with revenue ≥ $10k/month OR net worth ≥ $1M) → route to product sales call; show calendar based on owner map.
  - **Implementation:**

- [ ] If a specific product/path is selected AND commercial signal is below the bar AND timeline is ASAP / 0–3 months → route to product sales call or manual triage; show calendar only if product sales call is selected.
  - **Implementation:**

- [ ] [NEEDS REVIEW] Confirm: should the ‘commercial signal’ bar be revenue ≥ $10k/month OR net worth ≥ $1M, or something else?
  - **Implementation:**

- [ ] The original used revenue alone.
  - **Implementation:**

### Complex / guidance-led intent

- [ ] People who need diagnosis go to a sales call before any paid consult is sold.
  - **Implementation:**

- [ ] If path is Bespoke / Banking / Not sure / multiple complex areas AND (revenue ≥ $25k/month OR net worth ≥ $1M) → route to sales call; show calendar based on owner map.
  - **Implementation:**

- [ ] If revenue ≥ $50k/month OR net worth ≥ $5M AND answers are mixed/unclear → route to manual triage or senior sales call.
  - **Implementation:**

- [ ] [NEEDS REVIEW] Confirm: is the complex-guidance bar the right level given net worth is now a separate signal?
  - **Implementation:**

### Low commercial signal + low urgency (the main disqualification case)

- [ ] If revenue < $10k/month (or business is not main income) AND net worth < $250k AND timeline is 6+ months OR just exploring → use the budget readiness answer to decide:
  - **Implementation:**

- [ ] Budget readiness = Yes → allow through; route to product sales call or manual triage based on clarity.
  - **Implementation:**

- [ ] Budget readiness = Maybe → manual triage or nurture.
  - **Implementation:**

- [ ] Budget readiness = No → disqualify to free community / nurture.
  - **Implementation:**

- [ ] [NEEDS REVIEW] Confirm: should net worth < $250k be the right secondary cutoff?
  - **Implementation:**

### Low commercial signal but urgent

- [ ] Don’t hard-disqualify urgent leads solely because their revenue or net worth is low.
  - **Implementation:**

- [ ] If revenue < $10k/month AND net worth < $250k AND timeline = ASAP / 0–3 months → route based on product/path clarity.
  - **Implementation:**

- [ ] Urgency plus specific intent can still make the call worthwhile.
  - **Implementation:**

### No clear path and low commercial fit

- [ ] If no clear product/path AND revenue < $25k/month AND net worth < $1M AND budget readiness is not Yes → disqualify to free community / nurture.
  - **Implementation:**

## Disqualification Screen

- [ ] Recommended copy:
  - **Implementation:**

- [ ] “Based on your answers, the best next step is to keep using the free Redomiciled community for now. If your situation changes, or if you’re ready to invest at least €1,500 in professional support, you can submit again and we’ll route you to the right next step.”
  - **Implementation:**
