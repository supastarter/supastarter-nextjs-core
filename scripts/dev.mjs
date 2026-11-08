// `pnpm dev <variant>` from the workspace root starts exactly one variant.
import { spawn } from "node:child_process";
import process from "node:process";

const VARIANTS = ["nextjs", "tanstack-start"];
const [variant, ...rest] = process.argv.slice(2).filter((arg) => arg !== "--");

if (!variant || !VARIANTS.includes(variant)) {
  console.error(`Usage: pnpm dev <${VARIANTS.join("|")}>`);
  process.exit(1);
}

const child = spawn("pnpm", ["--dir", `variants/${variant}`, "run", "dev", ...rest], {
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code, signal) => {
  process.exit(signal ? 1 : (code ?? 1));
});
