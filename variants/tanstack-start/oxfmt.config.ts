import shared from "@repo/oxc-config/oxfmt";

export default {
  ...shared,
  ignorePatterns: [
    "src/routeTree.gen.ts",
    "dist/**",
    ".output/**",
    "test-results/**",
    "playwright-report/**",
  ],
};
