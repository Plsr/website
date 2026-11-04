import type { NextConfig } from "next";

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
