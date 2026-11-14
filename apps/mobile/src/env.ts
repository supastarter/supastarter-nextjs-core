import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Typed, validated environment variables. Expo inlines `EXPO_PUBLIC_` variables
 * into the bundle, so every one must be read with a static `process.env.NAME`
 * in `runtimeEnv`. Never put secrets here. Also list them in `.env.example`.
 */
export const env = createEnv({
  clientPrefix: "EXPO_PUBLIC_",
  client: {
    EXPO_PUBLIC_API_URL: z.url().optional(),
  },
  runtimeEnv: {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  },
  emptyStringAsUndefined: true,
});
