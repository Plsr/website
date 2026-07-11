import { getLogger } from "@logtape/logtape";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const logger = getLogger(["next-app", "middleware"]);

const REDACTED_HEADERS = new Set(["cookie", "authorization"]);

function loggableHeaders(headers: Headers) {
  return Object.fromEntries(
    [...headers].map(([key, value]) => [
      key,
      REDACTED_HEADERS.has(key.toLowerCase()) ? "[REDACTED]" : value,
    ]),
  );
}

export async function proxy(request: NextRequest) {
  const body = request.body ? await request.clone().text() : undefined;

  logger.info({
    method: request.method,
    url: request.nextUrl.pathname + request.nextUrl.search,
    headers: loggableHeaders(request.headers),
    body,
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
