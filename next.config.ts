import type { NextConfig } from "next";
import { siteUrl } from "./lib/seo";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  poweredByHeader: false,
  // In GitHub storage mode, Keystatic redirects localhost to 127.0.0.1 (GitHub
  // OAuth callbacks need a loopback IP). Next.js blocks dev assets for origins
  // other than localhost, which leaves /keystatic blank without this.
  allowedDevOrigins: ["127.0.0.1"],
  async redirects() {
    return [
      // First, so a www request leaves for the apex in one hop. The apex host
      // does not match, so this cannot loop. Query strings are forwarded.
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.chrisjarling.com",
          },
        ],
        destination: `${siteUrl}/:path*`,
        permanent: true,
      },
      // The typo must win before /posts/:slug, or it lands on a missing page.
      {
        source: "/posts/relocating-denark",
        destination: "/p/relocating-denmark",
        permanent: true,
      },
      {
        source: "/p/:date(\\d{4}-\\d{2}-\\d{2})-:slug([^/]+)",
        destination: "/p/:slug",
        permanent: true,
      },
      {
        source: "/posts/:date(\\d{4}-\\d{2}-\\d{2})-:slug([^/]+)",
        destination: "/p/:slug",
        permanent: true,
      },
      {
        source: "/posts/:slug([^/]+)",
        destination: "/p/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
