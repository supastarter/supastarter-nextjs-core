import { handleApiRequest } from "@repo/api/server";

function handler(request: Request) {
  return handleApiRequest(request, "/api/rpc");
}

export {
  handler as DELETE,
  handler as GET,
  handler as HEAD,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
