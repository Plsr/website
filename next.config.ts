import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  // In GitHub storage mode, Keystatic redirects localhost to 127.0.0.1 (GitHub
  // OAuth callbacks need a loopback IP). Next.js blocks dev assets for origins
  // other than localhost, which leaves /keystatic blank without this.
  allowedDevOrigins: ["127.0.0.1"],
  async redirects() {
    return [
      { source: "/posts", destination: "/essays", permanent: true },
      { source: "/notes", destination: "/blog", permanent: true },
    ];
  },
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
