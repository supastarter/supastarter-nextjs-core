# Architecture

supastarter core has two layouts:

- **Maintainer workspace** (this repository): shared tooling plus one technical shell per framework.
- **Customer project**: what the Builder produces from it. It contains exactly one framework app.

Background and alternatives: [decision 0001](decisions/0001-customer-project-is-a-turborepo-with-apps-web.md).

## Maintainer layout (this repository)

```
supastarter-core/
├── variants/
│   ├── nextjs/            # @repo/nextjs          → becomes apps/web
│   └── tanstack-start/    # @repo/tanstack-start  → becomes apps/web
├── tooling/
│   ├── typescript/        # @repo/typescript-config
│   └── oxc/               # @repo/oxc-config (Oxlint + Oxfmt)
├── scripts/               # maintainer-only checks and launchers
├── docs/                  # architecture.md, decisions/
├── AGENTS.md, turbo.json, package.json, pnpm-workspace.yaml
```

## Customer layout (Builder output)

```
my-saas/
├── apps/web/              # one variant, copied unchanged (package renamed to @repo/web)
├── packages/              # later: api (oRPC), ui (shadcn/ui), recipes…
├── tooling/{typescript,oxc}
├── scripts/
├── docs/{architecture.md,decisions/}
├── AGENTS.md, turbo.json, package.json, pnpm-workspace.yaml
```

More apps (docs, marketing, mobile) are added as `apps/<name>` without restructuring.

## Mapping

| Maintainer                                                       | Customer                                                    | How                                                                 |
| ---------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| `variants/nextjs/` or `variants/tanstack-start/`                 | `apps/web/`                                                 | Copied unchanged. Only `package.json` `name` changes to `@repo/web` |
| `tooling/typescript/`, `tooling/oxc/`                            | `tooling/typescript/`, `tooling/oxc/`                       | Copied unchanged                                                    |
| `packages/*` (added in later phases)                             | `packages/*`                                                | Copied (only the packages the customer's selection needs)           |
| `turbo.json`                                                     | `turbo.json`                                                | Same task definitions. All `outputs` are package-relative           |
| `pnpm-workspace.yaml` (`tooling/*`, `variants/*`)                | `pnpm-workspace.yaml` (`apps/*`, `packages/*`, `tooling/*`) | Generated                                                           |
| Root `package.json` scripts (run both variants)                  | Root `package.json` scripts (run the workspace)             | Generated. Same command names (`dev`, `check`, `verify`, …)         |
| `scripts/check-variants.mjs`, `scripts/dev.mjs`                  | —                                                           | Maintainer-only. Not shipped                                        |
| Root `oxfmt.config.ts` / `.oxlintrc.json` (ignore `variants/**`) | same files (ignore `apps/**`, `packages/**`)                | Generated. Each workspace package formats/lints itself              |
| `.github/workflows/ci.yml` (matrix over variants)                | CI running root `pnpm verify`                               | Generated                                                           |
| `docs/`, `AGENTS.md`                                             | `docs/`, `AGENTS.md`                                        | Customer-facing versions generated from these                       |

## Extractability rules for variants

A variant must keep working when it is moved to `apps/web` with no edits other than the package name:

1. **Shared config only through workspace packages.** Use `"extends": "@repo/typescript-config/…"`
   in `tsconfig.json`, `./node_modules/@repo/oxc-config/…` in `.oxlintrc.json` and
   `import … from "@repo/oxc-config/oxfmt"` in `oxfmt.config.ts`. Never use paths like
   `../../tooling/…`.
2. **No paths that leave the variant directory.** All paths in scripts, configs and tests resolve
   inside the variant: `scripts/*.ts` use `import.meta.dirname`, and Playwright and Vitest configs
   use package-relative paths.
3. **No repository-root assumptions.** A variant has its own `.gitignore`, `.env.example`, `engines`
   and full script contract. It does not read root files at runtime or in its scripts.
4. **No sibling or self-name references.** A variant never depends on, imports from or names another
   variant, and no file inside it references its own maintainer package name.
5. **Shared runtime code goes to `packages/<name>`** (from later phases on). Variants consume it as
   a `workspace:*` dependency.

`scripts/check-variants.mjs` enforces the command contract. CI's filtered install
(`--filter "./variants/<framework>..."`) proves rules 3 and 4 for dependencies.

## Commands

Each workspace package implements the same command contract: `dev`, `typegen`, `type-check`,
`lint`, `lint:fix`, `format`, `format:check`, `test`, `check`, `build`, `start`, `test:e2e` and
`verify`. Run them from the package directory (`variants/<framework>` here, `apps/web` for
customers) or from the workspace root through Turbo. See the [README](../README.md) for what each
command does.
