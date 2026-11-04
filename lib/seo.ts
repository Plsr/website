import type { Metadata } from "next";

/** Production origin. www redirects here; metadataBase resolves page paths against it. */
export const siteUrl = "https://chrisjarling.com";

const siteOpenGraph = {
  type: "website" as const,
  siteName: "Chris Jarling",
  title: "Chris Jarling",
  description:
    "Personal site of Chris Jarling — Engineering Manager at Gigs.",
  locale: "en_US",
};

/**
 * Self-referencing canonical and Open Graph URL for one pathname.
 * Paths are relative so the root metadataBase supplies the origin.
 * Open Graph is replaced (not deep-merged) by child segments, so this
 * repeats the site-wide fields and then applies page overrides.
 */
export function pageSeo(
  path: string,
  openGraph?: Metadata["openGraph"],
): Pick<Metadata, "alternates" | "openGraph"> {
  if (!path.startsWith("/")) {
    throw new Error(`Canonical path must start with "/": ${path}`);
  }

  return {
    alternates: { canonical: path },
    openGraph: {
      ...siteOpenGraph,
      ...openGraph,
      url: path,
    },
  };
}
