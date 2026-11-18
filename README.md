# supastarter

A TypeScript monorepo for building a Next.js web app with a typed API.

| Path           | What it is                                                          |
| -------------- | ------------------------------------------------------------------- |
| `apps/web`     | Next.js app. Serves the pages and the API at `/api/rpc`             |
| `packages/api` | API procedures (oRPC + Zod), the request handler and a typed client |
| `packages/ui`  | Tailwind CSS design tokens (colors, radii)                          |
| `tooling/*`    | Shared TypeScript and Oxlint configuration                          |

The web app uses Tailwind CSS and shadcn/ui on Base UI, with the olive palette and Inter and DM Sans
typefaces from supastarter for Next.js. It offers System, Light and Dark color modes, with System as
the default.

See [`docs/architecture.md`](docs/architecture.md) for how the pieces fit together.

## Requirements

- Node.js 26, the active LTS release (`.nvmrc`)
- pnpm 12.18.0. Node 26 no longer ships Corepack, so install it with `npm install -g pnpm@12.18.0`

## Getting started

```sh
nvm use
pnpm install
pnpm dev
```

`pnpm dev` starts the web app on http://localhost:3000.

The web app requires no environment variables. Its optional variables are listed in
`apps/web/.env.example`.

## Commands

Run these at the repository root. Turbo runs each task in every package that defines it and caches
the results. Add `--filter <package>` to limit a task to one package, for example
`pnpm lint --filter web`.

| Command         | What it does                                                                             |
| --------------- | ---------------------------------------------------------------------------------------- |
| `pnpm dev`      | Start the web app                                                                        |
| `pnpm check`    | Format check, lint (type-aware), type-check and unit tests. Never writes files           |
| `pnpm verify`   | `check`, the production build and the web end-to-end tests                               |
| `pnpm build`    | Build the web app for production                                                         |
| `pnpm test`     | Unit tests (Vitest). Run one file with `pnpm --filter @repo/api test src/router.test.ts` |
| `pnpm test:e2e` | Build the web app, then run the Playwright smoke tests against it                        |
| `pnpm format`   | Format all files (Oxfmt)                                                                 |
| `pnpm lint:fix` | Apply Oxlint auto-fixes                                                                  |

The end-to-end tests need a browser once: `pnpm --filter web exec playwright install chromium`.

## Common tasks

- **Add an API procedure** in `packages/api/src/router.ts`. The web app gets typed access
  through the `orpc` helper in `apps/web/src/lib/orpc.ts`.
- **Add a UI component** with `pnpm --dir apps/web exec shadcn add <name>`.
- **Change the theme** by editing the `:root` and `.dark` tokens in `packages/ui/theme.css`.
- **Add an environment variable:** declare it in the app's `src/env.ts` and list it in its
  `.env.example`.

## CI

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`:

- **Check:** `pnpm check`.
- **Web build + e2e:** installs only the web app and its packages, builds it and runs Playwright.
  Reports and traces are uploaded when a test fails.

Every job fails if it changes a tracked file.
