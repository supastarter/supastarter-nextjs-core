# Architecture

A pnpm workspace orchestrated by Turborepo.

```
apps/
  web/        Next.js app: pages + API route (name: web)
packages/
  api/        @repo/api: oRPC router, request handler, typed client
  ui/         @repo/ui: theme tokens
tooling/
  typescript/ @repo/typescript-config: strict tsconfig presets
  oxc/        @repo/oxc-config: Oxlint presets
```

Workspace packages export TypeScript source directly. The web app compiles them as part of its
build.

## API

`packages/api` defines every procedure in `src/router.ts` with oRPC. Inputs are validated with Zod.

- `@repo/api/server` exports `handleApiRequest`, a fetch handler. The web app mounts it at
  `/api/rpc` in `apps/web/src/app/api/rpc/[[...rest]]/route.ts`.
- `@repo/api/client` exports `createApiClient`, which returns a client typed from the router. It
  imports only types from the server code, so no server code reaches a bundle.

The web app wraps the client with `createTanstackQueryUtils` in `apps/web/src/lib/orpc.ts` and calls
procedures through TanStack Query, for example `useQuery(orpc.greeting.queryOptions({ input }))`.

Procedures accept POST. A procedure opts in to GET with `.route({ method: "GET" })`, as `health`
does for uptime checks (`GET /api/rpc/health`).

## UI and theming

`packages/ui/theme.css` defines the olive palette from supastarter for Next.js, using the
shadcn/ui token names.

- `:root` sets the light values and `.dark` overrides them for dark mode.
- `@theme inline` maps them to Tailwind utilities (`bg-background`, `text-primary`, `rounded-lg`, …).

The web app imports the tokens in `apps/web/src/app/globals.css` and defines the page gradient and
typography there. Inter and DM Sans are served locally from the Fontsource packages.

The color mode control (`apps/web/src/components/color-mode-toggle.tsx`) offers System, Light and
Dark. System is the default and follows the device setting. Next-themes stores the choice in
`localStorage` and sets the class on `<html>` before the page paints. Read or change the mode with
`useTheme()` from `next-themes`.

The shadcn CLI copies components based on Base UI into `apps/web/src/components/ui`. Components that
render a different element take a `render` prop, for example `<Button render={<a href="/" />} />`.

## Environment variables

The web app validates its variables with `@t3-oss/env-nextjs` and Zod in `apps/web/src/env.ts` and
reads them through the exported `env` object. The Next.js config imports the module so
`next build` validates the environment. See `apps/web/.env.example` for the supported variables.

## Testing

- **Unit tests:** Vitest, for plain TypeScript in packages (`src/**/*.test.ts`). `packages/api`
  tests procedures directly and through the HTTP handler with the typed client.
- **Web end-to-end:** Playwright runs `apps/web/e2e` against the production build. The smoke tests
  load the home page, which renders data from the API, switch the color mode and call the API over
  HTTP.

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
