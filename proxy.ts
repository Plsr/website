import { getLogger } from "@logtape/logtape";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const logger = getLogger(["next-app", "middleware"]);

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  logger.info({
    request,
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
