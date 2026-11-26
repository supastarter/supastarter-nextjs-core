# AGENTS.md

Guidance for agents working in this repository. [`docs/architecture.md`](docs/architecture.md) explains how the web app and packages fit together.

## Where things go

- API procedures: `packages/api/src/router.ts`. Validate every input with Zod.
- Web pages and routes: `apps/web/src/app`.
- Colors and radii: `packages/ui/theme.css`. Never hard-code colors in components.
- UI components: add them with the shadcn CLI, then edit the copied files.
- Environment variables: declare them in the app's `src/env.ts`, read them only through `env`, and list them in the app's `.env.example`.

## Rules

- pnpm only. TypeScript strict, Ultracite (Oxlint + Oxfmt). No ESLint or Prettier.
- No `any`, `@ts-ignore`, or lint or format disable comments.
- Pin exact dependency versions. Keep each package's dependencies in its own `package.json`.
- Unit tests are `src/**/*.test.ts` (Vitest). Web end-to-end tests are `apps/web/e2e/*.test.ts` (Playwright).
- Record product decisions in `docs/decisions/NNNN-title.md` using the template in [`docs/decisions/README.md`](docs/decisions/README.md).

## Before you finish

Run from the repository root:

```sh
pnpm fix      # format and apply lint fixes
pnpm check    # ultracite check, type-check, unit tests
pnpm verify   # check + production build + web end-to-end tests
```
