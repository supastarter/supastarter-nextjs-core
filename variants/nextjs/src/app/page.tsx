import { env } from "@/lib/env";

export default function HomePage() {
  return (
    <main>
      <h1>supastarter core</h1>
      <p>
        Next.js technical shell running in <code data-testid="node-env">{env.NODE_ENV}</code> mode.
      </p>
      <p>
        Health endpoint: <code>/api/health</code>
      </p>
    </main>
  );
}
