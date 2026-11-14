import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createApiClient } from "@repo/api/client";
import Constants from "expo-constants";

import { env } from "@/env";

function getApiUrl(): string {
  if (env.EXPO_PUBLIC_API_URL) {
    return env.EXPO_PUBLIC_API_URL;
  }

  // In development, reach the web app on the machine that runs the Expo dev server.
  const devServerHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (!devServerHost) {
    throw new Error("Set EXPO_PUBLIC_API_URL to the URL of the web app.");
  }
  return `http://${devServerHost}:3000`;
}

export const api = createApiClient({ url: () => `${getApiUrl()}/api/rpc` });

export const orpc = createTanstackQueryUtils(api);
