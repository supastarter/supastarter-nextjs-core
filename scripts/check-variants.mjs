// Asserts that every framework variant implements the full command contract,
// keeps its sources free of suppression comments and is self-contained (no
// references outside its own folder), so that turbo or CI can never pass by
// silently skipping a task.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const variantsDir = path.join(root, "variants");

const EXPECTED_VARIANTS = ["nextjs", "tanstack-start"];
const REQUIRED_SCRIPTS = [
  "dev",
  "typegen",
  "type-check",
  "lint",
  "lint:fix",
  "format",
  "format:check",
  "test",
  "check",
  "build",
  "start",
  "test:e2e",
  "verify",
];
const SOURCE_DIRS = ["src", "e2e"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs"]);
const GENERATED_FILES = new Set(["routeTree.gen.ts"]);
const FORBIDDEN_PATTERNS = [
  /@ts-ignore/,
  /@ts-nocheck/,
  /eslint-disable/,
  /oxlint-disable/,
  /oxfmt-ignore/,
  /prettier-ignore/,
];

// Variants must work from their own folder alone (docs/architecture.md,
// "Self-contained variants").
const SELF_CONTAINED_SCAN_EXTENSIONS = new Set([...SOURCE_EXTENSIONS, ".json", ".css"]);
const SELF_CONTAINED_SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  ".output",
  ".tanstack",
  ".turbo",
  "test-results",
  "playwright-report",
  "blob-report",
]);
const SELF_CONTAINED_FORBIDDEN = [
  {
    pattern: /(?:\.\.\/)+(?:tooling|variants|packages|apps)\//,
    reason: "relative path into a top-level workspace directory (use a @repo/* package instead)",
  },
  { pattern: /\bvariants\//, reason: "reference to the variants/ directory" },
  {
    pattern: new RegExp(`@repo/(?:${EXPECTED_VARIANTS.join("|")})\\b`),
    reason: "reference to a variant package name",
  },
];

/** @type {string[]} */
const errors = [];

/**
 * @param {string} dir
 * @returns {Generator<string>}
 */
function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      yield full;
    }
  }
}

/**
 * @param {string} dir
 * @returns {Generator<string>}
 */
function* walkVariant(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SELF_CONTAINED_SKIP_DIRS.has(entry.name)) yield* walkVariant(full);
    } else if (
      SELF_CONTAINED_SCAN_EXTENSIONS.has(path.extname(entry.name)) &&
      !GENERATED_FILES.has(entry.name) &&
      entry.name !== "next-env.d.ts"
    ) {
      yield full;
    }
  }
}

const present = readdirSync(variantsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .toSorted();

if (present.join(",") !== EXPECTED_VARIANTS.join(",")) {
  errors.push(
    `variants/ must contain exactly [${EXPECTED_VARIANTS.join(", ")}], found [${present.join(", ")}]`,
  );
}

for (const variant of EXPECTED_VARIANTS) {
  const variantRoot = path.join(variantsDir, variant);
  const rel = path.relative(root, variantRoot);

  /** @type {{ scripts?: Record<string, string> }} */
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(path.join(variantRoot, "package.json"), "utf8"));
  } catch (error) {
    errors.push(`${rel}: cannot read package.json (${String(error)})`);
    continue;
  }

  const scripts = pkg.scripts ?? {};
  for (const name of REQUIRED_SCRIPTS) {
    if (!scripts[name]?.trim()) {
      errors.push(`${rel}: missing required script "${name}"`);
    }
  }

  for (const dir of SOURCE_DIRS) {
    for (const file of walk(path.join(variantRoot, dir))) {
      const fileRel = path.relative(root, file);
      const base = path.basename(file);
      if (GENERATED_FILES.has(base)) continue;

      const isUnit = /\.test\.[cm]?[jt]sx?$/.test(base);
      const isE2e = /\.spec\.[cm]?[jt]sx?$/.test(base);
      if (dir === "src" && isE2e) {
        errors.push(`${fileRel}: *.spec.* files belong in e2e/ (Playwright only)`);
      }
      if (dir === "e2e" && isUnit) {
        errors.push(`${fileRel}: *.test.* files belong in src/ (Vitest only)`);
      }

      const content = readFileSync(file, "utf8");
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(content)) {
          errors.push(`${fileRel}: forbidden suppression comment matching ${pattern}`);
        }
      }
    }
  }

  for (const file of walkVariant(variantRoot)) {
    const fileRel = path.relative(root, file);
    let content = readFileSync(file, "utf8");
    if (path.relative(variantRoot, file) === "package.json") {
      content = content.replace(/^\s*"name":.*$/m, "");
    }
    for (const { pattern, reason } of SELF_CONTAINED_FORBIDDEN) {
      if (pattern.test(content)) {
        errors.push(`${fileRel}: references outside the variant folder: ${reason}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`check-variants: ${errors.length} problem(s)\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `check-variants: ${EXPECTED_VARIANTS.length} variants satisfy the command contract and are self-contained`,
);
