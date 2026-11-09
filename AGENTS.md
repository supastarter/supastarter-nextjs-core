# AGENTS.md

Guidance for agents working in the supastarter core **maintainer workspace**.

## What this repository is

- `variants/nextjs` and `variants/tanstack-start` are technical framework shells. In the customer
  project, the Builder copies exactly one of them **unchanged** to `apps/web`.
- `tooling/typescript` and `tooling/oxc` hold the shared TypeScript, Oxlint and Oxfmt config. They
  ship to customers unchanged.
- `packages/` doesn't exist yet. Shared runtime packages (api, ui, recipes) land there in later
  phases.
- Full layout and the maintainer-to-customer mapping: [`docs/architecture.md`](docs/architecture.md).
  Decisions: [`docs/decisions/`](docs/decisions/).

## Rules

- Keep every variant extractable to `apps/web` (see "Extractability rules" in
  `docs/architecture.md`):
  - Reference shared config only through `@repo/*` workspace packages, never `../../tooling`.
  - Never use paths that leave the variant directory.
  - Never reference a sibling variant or the variant's own maintainer package name.
- Make a change in both variants unless it is framework-specific.
- Use only pnpm, TypeScript `strict`, Oxlint and Oxfmt. No ESLint or Prettier. No `any`,
  `@ts-ignore` or lint/format-disable comments.
- Unit tests are `src/**/*.test.ts` (Vitest). Browser smoke tests are `e2e/**/*.spec.ts`
  (Playwright).
- Record architecture decisions in `docs/decisions/NNNN-title.md` (context, decision, alternatives,
  consequences).

## Before you finish

From the workspace root, or the same commands inside a variant directory:

```sh
pnpm check    # format, types, lint, unit tests (+ contract and guidance checks at the root)
pnpm verify   # check + production build + Playwright smoke
```
