// Checks that the agent/architecture guidance exists and that every decision
// record in docs/decisions/ (if any) is named and structured as documented in
// docs/decisions/README.md.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const REQUIRED_FILES = ["AGENTS.md", "docs/architecture.md", "docs/decisions/README.md"];
const DECISIONS_DIR = "docs/decisions";
const DECISION_NAME = /^\d{4}-[a-z0-9-]+\.md$/;
const DECISION_SECTIONS = [
  "## Context",
  "## Decision",
  "## Alternatives considered",
  "## Consequences",
];

/** @type {string[]} */
const errors = [];

for (const file of REQUIRED_FILES) {
  if (!existsSync(path.join(root, file))) errors.push(`${file}: missing`);
}

const records = existsSync(path.join(root, DECISIONS_DIR))
  ? readdirSync(path.join(root, DECISIONS_DIR)).filter(
      (name) => name.endsWith(".md") && name !== "README.md",
    )
  : [];

for (const name of records) {
  const rel = `${DECISIONS_DIR}/${name}`;
  if (!DECISION_NAME.test(name)) errors.push(`${rel}: name must match NNNN-kebab-title.md`);
  const lines = readFileSync(path.join(root, rel), "utf8").split("\n");
  for (const section of DECISION_SECTIONS) {
    if (!lines.includes(section)) errors.push(`${rel}: missing "${section}"`);
  }
}

if (errors.length > 0) {
  console.error(`guidance:check: ${errors.length} problem(s)\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`guidance:check: guidance present, ${records.length} decision record(s) valid`);
