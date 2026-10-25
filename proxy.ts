import { getLogger } from "@logtape/logtape";
import type { NextRequest } from "next/server";

const logger = getLogger(["next-app", "middleware"]);

export function proxy(request: NextRequest) {
  logger.info({
    method: request.method,
    path: request.nextUrl.pathname,
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
