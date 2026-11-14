# supastarter

A TypeScript monorepo for building a web app and a mobile app on one typed API.

| Path           | What it is                                                                       |
| -------------- | -------------------------------------------------------------------------------- |
| `apps/web`     | Next.js app. Serves the pages and the API at `/api/rpc`                          |
| `apps/mobile`  | Expo (React Native) app for iOS and Android. Calls the API served by the web app |
| `packages/api` | API procedures (oRPC + Zod), the request handler and a typed client              |
| `packages/ui`  | Design tokens (colors, radii) shared by both apps                                |
| `tooling/*`    | Shared TypeScript and Oxlint configuration                                       |

The web app uses Tailwind CSS and shadcn/ui. The mobile app uses Uniwind (Tailwind CSS for React
Native) and React Native Reusables, the React Native port of shadcn/ui. Both read the same tokens
from `packages/ui/theme.css` and follow the system light or dark mode.

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

`pnpm dev` starts the web app on http://localhost:3000 and the Expo dev server side by side. To use
Expo's keyboard shortcuts (`i` for the iOS simulator, `a` for the Android emulator), run the mobile
app in its own terminal with `pnpm --filter mobile dev`, or scan its QR code with Expo Go. The
mobile app calls the API of the running web app.

No environment variables are required. Each app lists the variables it reads in its own
`.env.example`.

## Commands

Run these at the repository root. Turbo runs each task in every package that defines it and caches
the results. Add `--filter <package>` to limit a task to one package, for example
`pnpm lint --filter web`.

| Command         | What it does                                                                             |
| --------------- | ---------------------------------------------------------------------------------------- |
| `pnpm dev`      | Start the web app and the Expo dev server                                                |
| `pnpm check`    | Format check, lint (type-aware), type-check and unit tests. Never writes files           |
| `pnpm verify`   | `check`, production builds of both apps and the web end-to-end tests                     |
| `pnpm build`    | Production build of the web app and an iOS + Android bundle of the mobile app            |
| `pnpm test`     | Unit tests (Vitest). Run one file with `pnpm --filter @repo/api test src/router.test.ts` |
| `pnpm test:e2e` | Build the web app, then run the Playwright smoke tests against it                        |
| `pnpm format`   | Format all files (Oxfmt)                                                                 |
| `pnpm lint:fix` | Apply Oxlint auto-fixes                                                                  |

The end-to-end tests need a browser once: `pnpm --filter web exec playwright install chromium`.

## Common tasks

- **Add an API procedure:** add it to `packages/api/src/router.ts`. Both apps get typed access
  through their `orpc` helper in `src/lib/orpc.ts`.
- **Add a UI component:** `pnpm --dir apps/web exec shadcn add <name>` for the web app and
  `pnpm --dir apps/mobile dlx @react-native-reusables/cli@latest add <name>` for the mobile app.
- **Change the theme:** edit `packages/ui/theme.css`. Themes generated for shadcn/ui can be pasted
  into its `light` and `dark` blocks.
- **Add an environment variable:** declare it in the app's `src/env.ts` and list it in its
  `.env.example`.
- **Remove the mobile app:** delete `apps/mobile` and the `mobile` job in
  `.github/workflows/ci.yml`, then run `pnpm install`.

## CI

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`:

- **Check:** `pnpm check`.
- **Web build + e2e:** installs only the web app and its packages, builds it and runs Playwright.
  Reports and traces are uploaded when a test fails.
- **Mobile bundle:** installs only the mobile app and its packages and bundles it for iOS and
  Android with `expo export`.

Every job fails if it changes a tracked file.
