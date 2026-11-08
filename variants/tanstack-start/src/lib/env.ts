const NODE_ENVS = ["development", "test", "production"] as const;

export type NodeEnv = (typeof NODE_ENVS)[number];

export interface Env {
  readonly NODE_ENV: NodeEnv;
}

export type EnvSource = Readonly<Record<string, string | undefined>>;

export class EnvValidationError extends Error {
  override name = "EnvValidationError";
}

function isNodeEnv(value: string): value is NodeEnv {
  return (NODE_ENVS as readonly string[]).includes(value);
}

/**
 * Parses and validates the technical environment. Product keys are added in
 * later phases; there are deliberately no provider secrets here.
 */
export function parseEnv(source: EnvSource): Env {
  const nodeEnv = source.NODE_ENV?.trim() || "development";

  if (!isNodeEnv(nodeEnv)) {
    throw new EnvValidationError(
      `Invalid NODE_ENV "${nodeEnv}". Expected one of: ${NODE_ENVS.join(", ")}.`,
    );
  }

  return Object.freeze({ NODE_ENV: nodeEnv });
}

export const env: Env = parseEnv(process.env);
