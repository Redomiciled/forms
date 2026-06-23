# Redomiciled Start Here Form Design Spec

> Updated: 2026-06-23
> Source of truth: Redomiciled public website at `https://www.redomiciled.global/` and Juan's scope note on 2026-06-23.

## Implementation Scope

Only update the visual system surfaces below:

- Font
- Color palette
- Logo, if the current asset does not fit the new white-background website style
- Browser tab image / favicon, using the same icon style shown on the new Redomiciled website

Do not add new page imagery. In particular, do not add the Hong Kong skyline or any other website hero image to the Start Here form or paid-consult path.

Do not change form logic, routing, ClickUp persistence, Cal.com behavior, Tally behavior, or paid-consult task ID handling as part of this design pass.

## Brand Direction

The current Redomiciled website uses a restrained editorial family-office style:

- White paper background
- Near-black primary text
- Cool grey secondary text and borders
- Blue-violet accent for CTAs, links, rules, and active states
- Serif headings paired with Inter UI/body text
- Generous spacing and simple section boundaries

The Start Here form and paid-consult path should feel like part of that public website, but remain focused form/product surfaces rather than landing pages.

## Color Tokens

Confirmed from the live website CSS:

| Token         |       Hex | Usage                                          |
| ------------- | --------: | ---------------------------------------------- |
| `paper`       | `#ffffff` | Main background and light surfaces             |
| `ink`         | `#0b0b0c` | Primary text and dark inverse surfaces         |
| `mist`        | `#f5f6f7` | Soft alternate background                      |
| `cloud`       | `#eceef0` | Hover/secondary surface                        |
| `line`        | `#e4e5e8` | Borders and dividers                           |
| `stone`       | `#6b7075` | Secondary body text                            |
| `accent`      | `#6364f9` | Primary CTA, active states, links, small rules |
| `accent-deep` | `#4b4ce0` | Primary CTA hover                              |

Use these tokens instead of the previous dark indigo gradient, white glass panels, and electric-glow styling.

## Typography

Confirmed from the live website:

- Body/UI: `Inter`
- Headings: `Source Serif 4`

Usage:

- Global body font should be Inter.
- Page titles, step headings, and confirmation headings should use Source Serif 4 with medium weight.
- Utility text, labels, nav text, buttons, and form controls should use Inter.
- Use uppercase letter spacing only for small eyebrow text such as `START HERE` or `PAID CONSULT`.
- Do not use viewport-width font scaling.

Recommended implementation:

```tsx
import { Inter, Source_Serif_4 } from "next/font/google";
```

Use font variables such as `--font-inter` and `--font-source-serif`, then map Tailwind `font-sans` and `font-heading` / `font-serif` to those variables.

## Logo And Tab Icon

Use the public website logo assets when needed:

- Header/brand wordmark: full color Redomiciled wordmark from `/img/logo.webp` on the public website.
- Browser tab image / favicon: use the blue-violet Redomiciled icon from the website metadata (`/icon.png` or `/favicon.ico`).

The current form's white mark-only logo is not appropriate on a white-background design. Prefer the full color wordmark for visible page branding and the website icon for tab/favicons.

## Page Shell

Use a simple light shell:

- `bg-paper`
- `text-ink`
- No radial gradients
- No decorative image backgrounds
- No glassmorphism
- No imported website hero imagery

The existing form structure can remain, but its surfaces should be rethemed:

- Outer page background: `paper`
- Main form panel: `paper` or `mist`
- Borders: `line`
- Secondary text: `stone`
- Primary action: `accent`, hover `accent-deep`
- Secondary action: transparent or `paper` with `ink/15` border

## Buttons

Primary:

- Rounded pill or soft rounded rectangle, depending on local form layout
- Background `accent`
- Text `paper`
- Hover `accent-deep`

Secondary:

- Background `paper` or transparent
- Border `line` or `ink/15`
- Text `ink`
- Hover border/text `accent`

Avoid black primary buttons unless they are used as dark-section inverse CTAs. The form should visually match the public website's blue-violet primary CTA.

## Form Fields

Use light fields:

- Background `paper`
- Border `line`
- Text `ink`
- Placeholder/help text `stone`
- Focus border/ring `accent`
- Error text should stay visibly red and accessible

Option cards and checkbox/radio cards should use light surfaces, accent selected states, and line borders. Avoid white-on-dark controls from the old design.

## Paid Consult Path

The paid-consult path should receive the same font, color, logo, and tab-icon treatment as Start Here.

Keep these out of scope:

- Paid-consult route logic
- Tally embed behavior
- Cal.com embed behavior
- ClickUp task ID parsing
- ClickUp status updates
- Any new imagery

## Verification Checklist

- [ ] Start Here route uses Inter body/UI text and Source Serif 4 headings.
- [ ] Paid consult route uses Inter body/UI text and Source Serif 4 headings.
- [ ] Old dark-gradient/glass theme is removed from visible shells.
- [ ] Logo works on white background.
- [ ] Browser tab icon matches the new website icon.
- [ ] No new page images were added.
- [ ] Existing form and paid-consult behavior still works.
- [ ] Desktop and mobile layouts have no text overlap or horizontal overflow.
