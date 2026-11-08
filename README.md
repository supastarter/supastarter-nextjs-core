# supastarter-core

Technical core for supastarter 3.0: one maintainer workspace with shared tooling and two isolated
framework variants (Next.js and TanStack Start). This is a technical shell only. It has no auth,
database, API layer, UI kit or product features yet.

## Layout

```
.
├── package.json            # maintainer scripts (turbo across both variants)
├── pnpm-workspace.yaml     # tooling/* + variants/*, one lockfile
├── turbo.json              # task graph, strict env mode, no global env wildcard
├── scripts/                # root-only checks (command contract, guidance stub, dev launcher)
├── tooling/
│   ├── typescript/         # @repo/typescript-config: strict base + nextjs / tanstack-start presets
│   └── oxc/                # @repo/oxc-config: shared Oxlint (type-aware) + Oxfmt config
└── variants/
    ├── nextjs/             # @repo/nextjs: Next.js App Router shell
    └── tanstack-start/     # @repo/tanstack-start: TanStack Start (Vite) shell
```

Each variant declares all of its own dependencies and scripts. It depends only on the shared
`tooling/*` packages. CI installs each variant on its own with a filtered install, which proves it
does not need its sibling.

## Versions

| Tool            | Version                                   |
| --------------- | ----------------------------------------- |
| Node.js         | `>=22.22.0` (`.nvmrc`: 22)                |
| pnpm            | `12.18.0` (exact)                         |
| TypeScript      | `7.0.2`                                   |
| Next.js         | `16.4.5`                                  |
| React           | `19.3.1`                                  |
| TanStack Start  | `1.169.5`                                 |
| TanStack Router | `1.170.46`                                |
| Vite            | `8.3.6`                                   |
| srvx            | `1.0.8`                                   |
| Turbo           | `2.11.10`                                 |
| Oxlint          | `1.92.0` (+ `oxlint-tsgolint` `7.0.2006`) |
| Oxfmt           | `0.77.0`                                  |
| Vitest          | `5.1.0`                                   |
| Playwright      | `1.65.0`                                  |

## Setup

```sh
nvm use                                  # Node 22 from .nvmrc
corepack enable                          # uses pnpm@12.18.0 from package.json
pnpm install --frozen-lockfile
pnpm --dir variants/nextjs exec playwright install --with-deps chromium   # once, for e2e
```

No environment variables are needed. See each variant's `.env.example`.

## Commands

Every command works **at the workspace root** (runs both variants through turbo) and **at a variant
root** (`variants/nextjs` or `variants/tanstack-start`, runs that variant only). Each command exits
non-zero on failure. None of them watch, prompt or swallow errors.

| Command                 | What it does                                                                                                                                                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`              | Variant root: start that app (Next.js :3000, TanStack Start :3001). Root: `pnpm dev nextjs` or `pnpm dev tanstack-start`                                                                                                                                         |
| `pnpm type-check`       | Runs framework typegen (`next typegen` / route tree generation), then `tsc --noEmit`                                                                                                                                                                             |
| `pnpm lint`             | Oxlint with type-aware rules, warnings fail. Never writes files                                                                                                                                                                                                  |
| `pnpm format:check`     | Oxfmt check. Never writes files                                                                                                                                                                                                                                  |
| `pnpm test`             | Vitest one-shot (`vitest run`). Fails when no test files match                                                                                                                                                                                                   |
| `pnpm test -- <filter>` | Run a single test file or filter. Example: `pnpm test -- src/lib/env.test.ts` in a variant root. Flags like `-t "<name>"` are forwarded too                                                                                                                      |
| `pnpm check`            | Fast read-only check: format, types, lint, unit tests. Root also runs the command-contract check and `guidance:check` (stub until AGENTS.md lands)                                                                                                               |
| `pnpm build`            | Production build, no secrets or external services                                                                                                                                                                                                                |
| `pnpm test:e2e`         | Production build, then Playwright starts the production server (Next.js :3100, TanStack Start :3101), waits for `/api/health`, runs the smoke tests and stops the server. Leaves `playwright-report/` and `test-results/` with traces and screenshots on failure |
| `pnpm verify`           | `check` + `test:e2e` (production build + browser smoke)                                                                                                                                                                                                          |
| `pnpm format`           | Write formatting fixes                                                                                                                                                                                                                                           |
| `pnpm lint:fix`         | Apply Oxlint auto-fixes                                                                                                                                                                                                                                          |

`pnpm format` and `pnpm lint:fix` are the only commands that write sources. Build and typegen output
(`.next/`, `next-env.d.ts`, `dist/`, `src/routeTree.gen.ts`) is gitignored. CI fails if `verify`
leaves any change in `git status`.

## CI

`.github/workflows/ci.yml` runs on each push to `main` and on pull requests:

- **Workspace contract**: `pnpm run check:root` (variant script contract, suppression-comment ban,
  guidance stub, root format and lint).
- **nextjs verify** / **tanstack-start verify**: a filtered install of only that variant, then
  `pnpm run verify` in the variant root, then a clean `git status` check. Playwright artifacts are
  uploaded on failure.

CI calls the variant scripts directly, so no turbo cache can hide a skipped task. It uses no
secrets, database, Docker or paid services.
