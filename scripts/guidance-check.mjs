// Checks that the agent/architecture guidance exists and that every decision
// record has the sections docs/decisions/ requires.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const REQUIRED_FILES = ["AGENTS.md", "docs/architecture.md"];
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

const decisions = existsSync(path.join(root, DECISIONS_DIR))
  ? readdirSync(path.join(root, DECISIONS_DIR)).filter((name) => name.endsWith(".md"))
  : [];

if (decisions.length === 0) errors.push(`${DECISIONS_DIR}: no decision records`);

for (const name of decisions) {
  const rel = `${DECISIONS_DIR}/${name}`;
  if (!DECISION_NAME.test(name)) errors.push(`${rel}: name must match NNNN-kebab-title.md`);
  const content = readFileSync(path.join(root, rel), "utf8");
  for (const section of DECISION_SECTIONS) {
    if (!content.split("\n").includes(section)) errors.push(`${rel}: missing "${section}"`);
  }
}

if (errors.length > 0) {
  console.error(`guidance:check: ${errors.length} problem(s)\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`guidance:check: guidance present, ${decisions.length} decision record(s) valid`);
