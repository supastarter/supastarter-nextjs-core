import { handleApiRequest } from "@repo/api/server";

const handler = async (request: Request) =>
  await handleApiRequest(request, "/api/rpc");

export {
  handler as DELETE,
  handler as GET,
  handler as HEAD,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
