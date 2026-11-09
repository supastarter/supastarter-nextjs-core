# AGENTS.md

Guidance for agents working in this repository.

## Layout

- `variants/nextjs` and `variants/tanstack-start` are technical framework shells. Each one is a
  self-contained workspace package.
- `tooling/typescript` and `tooling/oxc` hold the shared TypeScript, Oxlint and Oxfmt config.
- Details: [`docs/architecture.md`](docs/architecture.md).

## Rules

- Keep variants self-contained (see "Self-contained variants" in `docs/architecture.md`):
  - Reference shared config only through `@repo/*` workspace packages, never `../../tooling`.
  - Never use paths that leave the variant folder.
  - Never reference another variant.
- Make a change in both variants unless it is framework-specific.
- Use only pnpm, TypeScript `strict`, Oxlint and Oxfmt. No ESLint or Prettier. No `any`,
  `@ts-ignore` or lint/format-disable comments.
- Unit tests are `src/**/*.test.ts` (Vitest). Browser smoke tests are `e2e/**/*.spec.ts`
  (Playwright).
- Record product decisions in `docs/decisions/NNNN-title.md` using the template in
  [`docs/decisions/README.md`](docs/decisions/README.md).

## Before you finish

From the workspace root, or the same commands inside a variant folder:

```sh
pnpm check    # format, types, lint, unit tests (+ contract and guidance checks at the root)
pnpm verify   # check + production build + Playwright smoke
```
