# Cal.com Embed Research

> Research date: 2026-05-12 | Status: complete
> Scope: Decide the best Cal.com integration approach for the Redomiciled Start Here booked-call result screen.

## Summary

Use Cal.com's inline embed on the booked-call result screen. It keeps the booking flow on the Redomiciled page, supports event-type links such as `owner/event-type`, and can prefill the booking form with the lead's name, email, phone, and metadata from the Start Here form.

## Findings

### Inline Embed Fits The Result Screen

Cal.com documents inline embeds as the option to show a calendar inside a specific page area.

> "Show the embed inline anywhere on the webpage."
>
> - Source: [Adding embed to your webpage](https://cal.com/docs/core-features/embed/adding-embed-to-your-webpage)

**Reasoning:** The booked-call final screen should show scheduling as the next action without sending the lead to a separate page.

### Use Cal Links, Not Full URLs, For Embed Calls

Cal.com's inline instruction accepts an `elementOrSelector` and a `calLink`.

> "`calLink` - Cal Link that you want to embed e.g. john. No need to give the full URL https://cal.com/john."
>
> - Source: [Embed instructions](https://cal.com/help/embedding/embed-instructions)

**Reasoning:** The app can store full placeholder URLs for now, but the embed component should normalize real `https://cal.com/owner/event` URLs into `owner/event` before calling Cal.

### Prefill Lead Data And Metadata

Cal.com supports a `config` object on inline embeds for prefilled booking fields and metadata.

> "Booking form inside an embed can be prefilled as well."
>
> - Source: [Prefill booking form in Embed](https://cal.com/help/embedding/prefill-booking-form-embed)

**Reasoning:** Start Here already collects name, email, and phone; those should prefill Cal.com. Route metadata should also be attached so the booking can be reconciled later.

### Track Booking Completion Later With Embed Events

Cal.com embeds expose events via `Cal("on", ...)`.

> "You can listen to an event that occurs in embedded cal link as follows."
>
> - Source: [Embed Events](https://cal.com/help/embedding/embed-events)

**Reasoning:** Once real Cal.com accounts and downstream persistence exist, the app can listen for booking events and pass the booking ID into ClickUp or the webhook flow.

## Recommendation

Implement the official vanilla Cal.com embed API now instead of adding the React npm package.

The React package install currently fails in this repo with `npm error Invalid Version:`, matching the dependency-resolution issue seen during the shadcn migration. The vanilla embed API avoids that blocker and is still an official Cal.com integration path.

## Next Steps

- [x] Add a booked-call final-screen panel that renders the Cal.com inline embed when a real Cal link is configured.
- [x] Keep a polished placeholder state while Erik/Will Cal.com links are unknown.
- [ ] Replace `PLACEHOLDER_CAL_COM_ERIK_URL` and `PLACEHOLDER_CAL_COM_WILL_URL` with real event-type links.
- [ ] Add booking-success event handling once the webhook/ClickUp persistence path exists.
