import { createEnv } from "@t3-oss/env-nextjs";

/**
 * Typed, validated environment variables. Declare every variable here (server-only
 * ones in `server`, `NEXT_PUBLIC_` ones in `client`) and read them from `env`, never
 * from `process.env`. Also list them in `.env.example`.
 */
export const env = createEnv({
  server: {},
  client: {},
  experimental__runtimeEnv: {},
  emptyStringAsUndefined: true,
});
