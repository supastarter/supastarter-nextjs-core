// Generates src/routeTree.gen.ts exactly like `vite dev` / `vite build` do,
// including the TanStack Start `Register` footer that `tsr generate` omits,
// by booting the real Vite config once without listening or watching.
import { access } from "node:fs/promises";
import path from "node:path";

import { createServer } from "vite";

const root = path.resolve(import.meta.dirname, "..");
const routeTree = path.join(root, "src/routeTree.gen.ts");

const server = await createServer({
  root,
  logLevel: "warn",
  server: { middlewareMode: true, watch: null, ws: false },
});

try {
  await server.pluginContainer.buildStart({});
  await access(routeTree);
} finally {
  await server.close();
}

console.log(`typegen: generated ${path.relative(root, routeTree)}`);
