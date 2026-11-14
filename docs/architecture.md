# Architecture

A pnpm workspace orchestrated by Turborepo.

```
apps/
  web/        Next.js app: pages + API route (name: web)
  mobile/     Expo app for iOS and Android (name: mobile)
packages/
  api/        @repo/api: oRPC router, request handler, typed client
  ui/         @repo/ui: theme tokens
tooling/
  typescript/ @repo/typescript-config: strict tsconfig presets
  oxc/        @repo/oxc-config: Oxlint presets
```

Workspace packages export TypeScript source directly. They have no build step; each app compiles
them as part of its own build.

## API

`packages/api` defines every procedure in `src/router.ts` with oRPC. Inputs are validated with Zod.

- `@repo/api/server` exports `handleApiRequest`, a fetch handler. The web app mounts it at
  `/api/rpc` in `apps/web/src/app/api/rpc/[[...rest]]/route.ts`.
- `@repo/api/client` exports `createApiClient`, which returns a client typed from the router. It
  imports only types from the server code, so no server code reaches a bundle.

Each app wraps the client with `createTanstackQueryUtils` in `src/lib/orpc.ts` and calls procedures
through TanStack Query, for example `useQuery(orpc.greeting.queryOptions({ input }))`.

The mobile app has no server of its own. It calls the API served by the web app at
`EXPO_PUBLIC_API_URL`. In development that defaults to port 3000 on the machine running the Expo dev
server, so simulators and physical devices on the same network both work.

Procedures accept POST. A procedure opts in to GET with `.route({ method: "GET" })`, as `health`
does for uptime checks (`GET /api/rpc/health`).

## UI and theming

`packages/ui/theme.css` defines the color and radius tokens once, using the shadcn/ui token names:

- A `light` and a `dark` block set the raw values (`--background`, `--primary`, …).
- `@theme inline` maps them to Tailwind utilities (`bg-background`, `text-primary`, `rounded-lg`, …).

Each app imports the file from its global stylesheet and decides what `light` and `dark` mean:

- **Web** (`apps/web/src/app/globals.css`): Tailwind CSS. `light` and `dark` follow the
  `prefers-color-scheme` media query.
- **Mobile** (`apps/mobile/src/global.css`): Uniwind compiles the same file at bundle time and
  switches themes with the device setting.

Components are copied into each app by their CLI and can be edited freely:

- **Web:** shadcn/ui (Radix base) in `apps/web/src/components/ui`.
- **Mobile:** React Native Reusables in `apps/mobile/src/components/ui`. They mirror the shadcn/ui
  APIs, including `asChild`.

## Environment variables

Each app validates its variables with t3-env and Zod in `src/env.ts` and reads them only from the
exported `env` object:

- **Web:** `@t3-oss/env-nextjs`. `next.config.ts` imports the module, so `next build` fails on a
  missing or invalid variable.
- **Mobile:** `@t3-oss/env-core`. Only `EXPO_PUBLIC_` variables exist, and Expo inlines them into the
  bundle, so they must never hold secrets.

Each app's `.env.example` lists exactly the variables that app reads.

## Testing

- **Unit tests:** Vitest, for plain TypeScript in packages (`src/**/*.test.ts`). `packages/api`
  tests procedures directly and through the HTTP handler with the typed client.
- **Web end-to-end:** Playwright runs `apps/web/e2e` against the production build. The smoke tests
  load the home page, which renders data from the API, and call the API over HTTP.
- **Mobile:** the CI gate is type-check, lint and an `expo export` bundle for iOS and Android. Keep
  screens thin and put logic in packages, where Vitest covers it.

## Tooling

- TypeScript 7 in strict mode with `noUncheckedIndexedAccess`. Presets live in `tooling/typescript`.
- Oxlint with type-aware rules. Presets live in `tooling/oxc`; each package has a `.oxlintrc.json`.
- Oxfmt formats the whole repository from the root `.oxfmtrc.json`, including import and Tailwind
  class order.
- Turbo runs `lint`, `type-check`, `test` and `build` per package. These tasks depend on a `transit`
  task, so a change in a package invalidates the cache of every package that uses it.

## Decisions

`docs/decisions/` records product decisions, one file per decision. See
[`docs/decisions/README.md`](decisions/README.md) for the format.
