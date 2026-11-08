import type { Env, NodeEnv } from "./env";

export interface HealthStatus {
  readonly status: "ok";
  readonly framework: "nextjs";
  readonly nodeEnv: NodeEnv;
}

export function getHealthStatus(env: Env): HealthStatus {
  return { status: "ok", framework: "nextjs", nodeEnv: env.NODE_ENV };
}
