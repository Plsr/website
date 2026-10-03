import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "@/keystatic.config";

// In GitHub storage mode, makeRouteHandler throws when the GitHub app secrets
// are missing. Create it on the first request so the build doesn't need them.
let handler: ReturnType<typeof makeRouteHandler> | undefined;

function getHandler() {
  handler ??= makeRouteHandler({ config });
  return handler;
}

export const GET = (request: Request) => getHandler().GET(request);
export const POST = (request: Request) => getHandler().POST(request);
