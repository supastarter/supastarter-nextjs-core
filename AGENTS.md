# AGENTS.md

Guidance for agents working in this repository. [`docs/architecture.md`](docs/architecture.md)
explains how the apps and packages fit together.

## Where things go

- API procedures: `packages/api/src/router.ts`. Validate every input with Zod.
- Web pages and routes: `apps/web/src/app`. Mobile screens: `apps/mobile/src/app` (Expo Router).
- Colors and radii: `packages/ui/theme.css`. Never hard-code colors in components.
- Logic shared by both apps belongs in a package, not in an app. Keep mobile screens thin.
- UI components: add them with the shadcn CLI (web) or the React Native Reusables CLI (mobile),
  then edit the copied files. Don't hand-write a component either CLI provides.
- Environment variables: declare them in the app's `src/env.ts`, read them only through `env`, and
  list them in the app's `.env.example`.

## Rules

- pnpm only. TypeScript strict, Oxlint and Oxfmt. No ESLint or Prettier.
- No `any`, `@ts-ignore`, or lint or format disable comments.
- Pin exact dependency versions. Keep each package's dependencies in its own `package.json`.
- Unit tests are `src/**/*.test.ts` (Vitest). Web end-to-end tests are `apps/web/e2e/*.spec.ts`
  (Playwright).
- Record product decisions in `docs/decisions/NNNN-title.md` using the template in
  [`docs/decisions/README.md`](docs/decisions/README.md).

## Before you finish

Run from the repository root:

```sh
pnpm format   # fix formatting
pnpm check    # format check, lint, type-check, unit tests
pnpm verify   # check + production builds + web end-to-end tests
```
