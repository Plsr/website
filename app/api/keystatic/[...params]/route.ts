import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "@/keystatic.config";

// In GitHub storage mode, makeRouteHandler throws when the GitHub app secrets
// are missing. Create it on the first request so the build doesn't need them.
let handler: ReturnType<typeof makeRouteHandler> | undefined;

function getHandler() {
  handler ??= makeRouteHandler({ config });
  return handler;
}

/**
 * Keystatic builds the GitHub OAuth redirect_uri from the request URL. Behind
 * the reverse proxy, the standalone server reports its bind address
 * (http://0.0.0.0:3000) there, which GitHub rejects. Rebuild the URL from the
 * public host and protocol the proxy forwards. A spoofed host can't redirect
 * the login elsewhere: GitHub only accepts the app's registered callback URLs.
 */
function withPublicUrl(request: Request) {
  const host = (
    request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  )?.split(",")[0].trim();
  if (!host) return request;

  const url = new URL(request.url);
  const protocol =
    request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ??
    url.protocol.replace(":", "");

  return new Request(
    `${protocol}://${host}${url.pathname}${url.search}`,
    request,
  );
}

export const GET = (request: Request) =>
  getHandler().GET(withPublicUrl(request));
export const POST = (request: Request) => getHandler().POST(request);
