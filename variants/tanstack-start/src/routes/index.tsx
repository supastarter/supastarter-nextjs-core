import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { env } from "@/lib/env";

const getNodeEnv = createServerFn({ method: "GET" }).handler(() => env.NODE_ENV);

export const Route = createFileRoute("/")({
  loader: () => getNodeEnv(),
  component: HomePage,
});

function HomePage() {
  const nodeEnv = Route.useLoaderData();

  return (
    <main>
      <h1>supastarter core</h1>
      <p>
        TanStack Start technical shell running in <code data-testid="node-env">{nodeEnv}</code>{" "}
        mode.
      </p>
      <p>
        Health endpoint: <code>/api/health</code>
      </p>
    </main>
  );
}
