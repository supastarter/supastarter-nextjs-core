import shared from "@repo/oxc-config/oxfmt";

export default {
  ...shared,
  ignorePatterns: ["next-env.d.ts", ".next/**", "test-results/**", "playwright-report/**"],
};
