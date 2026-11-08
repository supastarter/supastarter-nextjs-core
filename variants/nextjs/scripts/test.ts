// `pnpm test -- <file>` forwards a literal `--`, after which Vitest ignores
// positional filters. Strip leading separators so filters and flags reach
// `vitest run` (one-shot; never watch mode).
import { spawnSync } from "node:child_process";
import process from "node:process";

const args = process.argv.slice(2);
while (args[0] === "--") args.shift();

const result = spawnSync("vitest", ["run", ...args], { stdio: "inherit" });

if (result.error) throw result.error;
process.exit(result.status ?? 1);
