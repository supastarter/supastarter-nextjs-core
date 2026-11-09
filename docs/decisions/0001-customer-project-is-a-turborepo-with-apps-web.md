# 0001: Customer project is a Turborepo monorepo with the framework app at `apps/web`

- **Status:** Accepted
- **Date:** 2026-11-09
- **Decided by:** Jonathan (product owner)

## Context

This repository (`supastarter-core`) is the maintainer workspace. It holds the shared tooling and one
technical shell per framework under `variants/<framework>`. A later Builder produces the project a
customer receives, which contains exactly one framework.

We had to decide how that customer project is shaped:

- Where does the chosen framework app live?
- How do shared packages that come in later phases (`api` with oRPC, `ui` with shadcn/ui, recipes)
  and extra apps (docs, marketing, mobile) fit in without restructuring the customer's repo?

## Decision

The customer project is a pnpm + Turborepo monorepo. The chosen variant is copied **unchanged** into
`apps/web` as one workspace app among potentially many:

```
my-saas/
├── apps/web/                 # content of variants/nextjs OR variants/tanstack-start
├── packages/                 # later: api (oRPC), ui (shadcn/ui), recipes…
├── tooling/{typescript,oxc}  # same packages as in this repo
├── scripts/
├── docs/{architecture.md,decisions/}
├── AGENTS.md, turbo.json, package.json, pnpm-workspace.yaml
```

The maintainer layout stays as is. `variants/<framework>` is the source of truth for `apps/web`, so
every variant must work without changes when moved there. The mapping is documented in
[`docs/architecture.md`](../architecture.md).

## Alternatives considered

### A. Flat single-app root (the variant _is_ the repository root)

- Pros: simplest possible project for one app. One `package.json`, no workspace, no Turbo.
- Cons:
  - Shared packages (`api`, `ui`, recipes) would have to live inside the app's `src/`, or the repo
    would need converting to a monorepo later. That conversion is a disruptive restructure of the
    customer's repo, with a risk of merge conflicts on every kit update.
  - Additional apps (docs, marketing, mobile) can't be added without the same restructure.
  - Shared tooling (`tooling/typescript`, `tooling/oxc`) would have to be inlined, which diverges
    from the maintainer workspace and makes updates harder to apply.
- Rejected because the expected growth path (more packages and apps) would force a restructure.

### B. Turborepo monorepo with the variant at `apps/web` (chosen)

- Pros:
  - Same workspace mechanics as the maintainer repo (pnpm workspaces, Turbo, `@repo/*` tooling
    packages).
  - New packages and apps are additive: drop them into `packages/` or `apps/`.
  - The app keeps its own complete command contract (`check`, `verify`, …), so it can be checked in
    isolation with `--filter`.
- Cons:
  - Slightly more structure on day one than a single app needs.
  - Root scripts orchestrate through Turbo rather than calling the framework CLI directly.

## Consequences

- **Variants must stay extractable.** A variant may only reference shared tooling through workspace
  package dependencies (`@repo/typescript-config`, `@repo/oxc-config`), never through relative paths
  that leave the variant directory. It must not assume it is at the repository root and must not
  depend on a sibling variant.
- **Package name is set by the Builder.** In the customer project the app's package name becomes
  `@repo/web`. Maintainer names (`@repo/nextjs`, `@repo/tanstack-start`) must not be referenced from
  inside a variant.
- **Root files differ between the two layouts.** `pnpm-workspace.yaml`, the root `package.json`
  scripts, root lint/format ignore patterns and CI are layout-specific. The Builder generates the
  customer versions of these files. Maintainer-only scripts (`scripts/check-variants.mjs`,
  `scripts/dev.mjs`) are not shipped as-is.
- **Future shared code goes to `packages/`.** In this repo that means a top-level `packages/`
  directory added to `pnpm-workspace.yaml` when the first package lands. Variants consume packages as
  `workspace:*` dependencies, never by relative import.
- **Verified:** both variants were copied to `apps/web` of a generated customer layout. In both, the
  only edit was the package rename, and `pnpm check` plus `pnpm verify` passed.
