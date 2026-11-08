import { env } from "@/lib/env";
import { getHealthStatus } from "@/lib/health";

export const dynamic = "force-dynamic";

export function GET(): Response {
  return Response.json(getHealthStatus(env), {
    headers: { "Cache-Control": "no-store" },
  });
}
