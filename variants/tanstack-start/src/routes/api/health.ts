import { createFileRoute } from "@tanstack/react-router";

import { env } from "@/lib/env";
import { getHealthStatus } from "@/lib/health";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: () =>
        Response.json(getHealthStatus(env), {
          headers: { "Cache-Control": "no-store" },
        }),
    },
  },
});
