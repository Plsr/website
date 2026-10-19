import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  // Homepage ISR re-reads these files at runtime. File tracing does not follow
  // Keystatic's directory reads, so without this the revalidated page drops
  // the featured posts and case-study links.
  outputFileTracingIncludes: {
    "/": ["./content/posts/**/*", "./content/case-studies/**/*"],
  },
  // In GitHub storage mode, Keystatic redirects localhost to 127.0.0.1 (GitHub
  // OAuth callbacks need a loopback IP). Next.js blocks dev assets for origins
  // other than localhost, which leaves /keystatic blank without this.
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
