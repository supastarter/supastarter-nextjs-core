# Architecture

supastarter core is a pnpm + Turborepo workspace. It has shared tooling packages and one technical
shell per framework.

## Layout

```
supastarter-core/
├── variants/
│   ├── nextjs/            # @repo/nextjs: Next.js App Router shell
│   └── tanstack-start/    # @repo/tanstack-start: TanStack Start (Vite) shell
├── tooling/
│   ├── typescript/        # @repo/typescript-config: strict base + framework presets
│   └── oxc/               # @repo/oxc-config: shared Oxlint + Oxfmt config
├── scripts/               # workspace-level checks and the dev launcher
├── docs/                  # architecture.md, decisions/
├── AGENTS.md, turbo.json, package.json, pnpm-workspace.yaml
```

- **Variants** are standalone workspace packages. Each declares all of its own dependencies and
  implements the full command contract.
- **Tooling packages** hold configuration only and have no runtime code.
- **Root** `package.json` scripts orchestrate the variants through Turbo. The root also checks its
  own files (`scripts/`, `tooling/`, docs).

## Self-contained variants

Each variant must be installable, checkable and buildable on its own folder, without relying on
where it sits in the workspace:

1. **Shared config only through workspace packages.** Use `"extends": "@repo/typescript-config/…"`
   in `tsconfig.json`, `./node_modules/@repo/oxc-config/…` in `.oxlintrc.json` and
   `import … from "@repo/oxc-config/oxfmt"` in `oxfmt.config.ts`. Never use relative paths like
   `../../tooling/…`.
2. **No paths that leave the variant folder.** Every path in scripts, configs and tests resolves
   inside the variant: `scripts/*.ts` use `import.meta.dirname`, and Playwright and Vitest configs
   use package-relative paths.
3. **No assumptions about the repository root.** Each variant has its own `.gitignore`,
   `.env.example`, `engines` and full script contract.
4. **No cross-variant references.** A variant never depends on, imports from or names a variant
   package.

`scripts/check-variants.mjs` (part of `pnpm check`) enforces the command contract and rules 1, 2
and 4. CI installs each variant with a filtered install (`--filter "./variants/<framework>..."`),
which proves its dependencies are complete.

## Commands

Each variant implements the same command contract: `dev`, `typegen`, `type-check`, `lint`,
`lint:fix`, `format`, `format:check`, `test`, `check`, `build`, `start`, `test:e2e` and `verify`.
Run them from the variant folder or from the workspace root through Turbo. See the
[README](../README.md) for what each command does.

## Decisions

`docs/decisions/` records product decisions, one file per decision. See
[`docs/decisions/README.md`](decisions/README.md) for the format.
