import type { Env, NodeEnv } from "./env";

export interface HealthStatus {
  readonly status: "ok";
  readonly framework: "tanstack-start";
  readonly nodeEnv: NodeEnv;
}

export function getHealthStatus(env: Env): HealthStatus {
  return { status: "ok", framework: "tanstack-start", nodeEnv: env.NODE_ENV };
}
