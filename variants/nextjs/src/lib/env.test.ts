import { describe, expect, it } from "vitest";

import { EnvValidationError, parseEnv } from "./env";
import { getHealthStatus } from "./health";

describe("parseEnv", () => {
  it("defaults NODE_ENV to development when unset or blank", () => {
    expect(parseEnv({}).NODE_ENV).toBe("development");
    expect(parseEnv({ NODE_ENV: "  " }).NODE_ENV).toBe("development");
  });

  it("accepts every supported NODE_ENV", () => {
    for (const value of ["development", "test", "production"] as const) {
      expect(parseEnv({ NODE_ENV: value }).NODE_ENV).toBe(value);
    }
  });

  it("rejects unknown NODE_ENV values", () => {
    expect(() => parseEnv({ NODE_ENV: "staging" })).toThrow(EnvValidationError);
  });

  it("returns an immutable object that ignores unrelated variables", () => {
    const env = parseEnv({ NODE_ENV: "production", SOME_PROVIDER_KEY: "secret" });
    expect(env).toEqual({ NODE_ENV: "production" });
    expect(Object.isFrozen(env)).toBe(true);
  });
});

describe("getHealthStatus", () => {
  it("reports the framework and runtime mode", () => {
    expect(getHealthStatus(parseEnv({ NODE_ENV: "production" }))).toEqual({
      status: "ok",
      framework: "nextjs",
      nodeEnv: "production",
    });
  });
});
