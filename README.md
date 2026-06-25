# Redomiciled Start Here Form

Next.js application for the Redomiciled Start Here intake form.

This repo is owned by PulpSense and is part of Redomiciled's Community -> Onboarding -> Conversion funnel implementation.

## Design Source

- `DESIGN.md` is the source of truth for visual direction, tokens, and implementation guidance.
- shadcn/ui is used as a local component source, not as the brand direction. Adapt generated components to `DESIGN.md`.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript with strict compiler settings
- Tailwind CSS v4
- shadcn/ui
- Vitest + React Testing Library
- Playwright for browser-level form tests
- ESLint + Prettier + Husky + lint-staged
- gitleaks secret scanning

## Commands

```bash
npm run dev
npm run check
npm run build
npm run test:e2e
```

`npm run check` runs formatting, ESLint with zero warnings, TypeScript, and Vitest. Playwright is intentionally separate because browser tests are slower.

## Quality Gates

Pre-commit runs:

```bash
npm run precommit
```

That script runs staged formatting, secret scanning, lint, typecheck, and unit tests.
`npm run secrets:check` scans staged changes with gitleaks using `.gitleaks.toml`.
Install gitleaks locally first, for example with `brew install gitleaks`.

Run `npm run test:e2e` before opening or merging changes that affect the form flow.

## Deploy

Production is the Redomiciled Vercel `forms` project connected to this GitHub repo.

- Production branch: `main`
- Production URL: `https://start.redomiciled.global`
- Vercel project: `https://vercel.com/redomiciled/forms`

Deploy production changes by pushing or merging to `main` and verifying the GitHub commit status `Vercel - forms` succeeds. Do not use a local `npx vercel deploy --prod` unless the CLI is explicitly scoped to the Redomiciled team and linked to the `forms` project; otherwise it may deploy a different Vercel project.
