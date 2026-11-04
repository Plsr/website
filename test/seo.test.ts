import { createRequire } from "node:module";
import type { Metadata } from "next";
import { expect, test } from "vitest";
import nextConfig from "../next.config";
import { metadata as aboutMetadata } from "@/app/about/page";
import { metadata as bookmarksMetadata } from "@/app/bookmarks/page";
import { generateMetadata as bookmarkMetadata } from "@/app/bookmarks/[slug]/page";
import { metadata as cvMetadata } from "@/app/cv/page";
import { metadata as linksMetadata } from "@/app/links/page";
import { metadata as notesMetadata } from "@/app/notes/page";
import { metadata as nowMetadata } from "@/app/now/page";
import { generateMetadata as keystaticMetadata } from "@/app/keystatic/[[...params]]/page";
import { generateMetadata as postMetadata } from "@/app/p/[slug]/page";
import { metadata as homeMetadata } from "@/app/page";
import { metadata as postsMetadata } from "@/app/posts/page";
import { siteUrl } from "@/lib/seo";

const require = createRequire(import.meta.url);
const { matchHas } = require("next/dist/shared/lib/router/utils/prepare-destination") as {
  matchHas: (
    req: { headers: { host?: string } },
    query: Record<string, string>,
    has?: ReadonlyArray<{ type: string; value?: string; key?: string }>,
    missing?: ReadonlyArray<{ type: string; value?: string; key?: string }>,
  ) => false | Record<string, string>;
};
const { getRedirectStatus } = require("next/dist/lib/redirect-status") as {
  getRedirectStatus: (route: { permanent?: boolean; statusCode?: number }) => number;
};

function pageUrls(metadata: Metadata) {
  const canonical = metadata.alternates?.canonical;
  const og = metadata.openGraph;
  return {
    canonical: typeof canonical === "string" ? canonical : undefined,
    ogUrl: og && "url" in og && typeof og.url === "string" ? og.url : undefined,
  };
}

test("www redirects permanently to the apex and the apex does not match", async () => {
  expect(nextConfig.redirects).toBeTypeOf("function");
  const redirects = await nextConfig.redirects!();
  const www = redirects.find((rule) =>
    rule.has?.some(
      (condition) =>
        condition.type === "host" && condition.value === "www.chrisjarling.com",
    ),
  );

  expect(redirects[0]).toBe(www);
  expect(www).toMatchObject({
    source: "/:path*",
    destination: `${siteUrl}/:path*`,
    permanent: true,
  });
  expect(redirects.slice(1).map((rule) => rule.source)).toEqual([
    "/posts/relocating-denark",
    "/p/:date(\\d{4}-\\d{2}-\\d{2})-:slug([^/]+)",
    "/posts/:date(\\d{4}-\\d{2}-\\d{2})-:slug([^/]+)",
    "/posts/:slug([^/]+)",
  ]);
  expect(www?.destination.startsWith(`${siteUrl}/`)).toBe(true);
  expect(www?.destination).not.toContain("?");
  expect(getRedirectStatus(www!)).toBe(308);

  expect(
    redirects.some((rule) =>
      rule.has?.some(
        (condition) =>
          condition.type === "host" && condition.value === "chrisjarling.com",
      ),
    ),
  ).toBe(false);

  expect(
    matchHas(
      { headers: { host: "www.chrisjarling.com" } },
      {},
      www?.has,
      www?.missing,
    ),
  ).toBeTruthy();
  expect(
    matchHas(
      { headers: { host: "chrisjarling.com" } },
      {},
      www?.has,
      www?.missing,
    ),
  ).toBe(false);
});

test("canonical and og:url are the page itself", async () => {
  const staticPages: Array<[string, Metadata]> = [
    ["/", homeMetadata],
    ["/posts", postsMetadata],
    ["/notes", notesMetadata],
    ["/bookmarks", bookmarksMetadata],
    ["/about", aboutMetadata],
    ["/cv", cvMetadata],
    ["/now", nowMetadata],
    ["/links", linksMetadata],
  ];

  for (const [path, metadata] of staticPages) {
    expect(pageUrls(metadata), path).toEqual({ canonical: path, ogUrl: path });
  }

  const post = await postMetadata({
    params: Promise.resolve({
      slug: "how-to-split-big-pull-requests",
    }),
  });
  const postPath = "/p/how-to-split-big-pull-requests";
  expect(pageUrls(post)).toEqual({ canonical: postPath, ogUrl: postPath });

  const dated = await postMetadata({
    params: Promise.resolve({
      slug: "2025-07-27-how-to-split-big-pull-requests",
    }),
  });
  expect(dated.title).toBe("Not found");
  expect(pageUrls(dated).canonical).toBeUndefined();
  expect(pageUrls(dated).ogUrl).toBeUndefined();

  const bookmarkSlug =
    "how-to-be-more-ambitious-a-tutorial-for-humans-with-models";
  const bookmark = await bookmarkMetadata({
    params: Promise.resolve({ slug: bookmarkSlug }),
  });
  const bookmarkPath = `/bookmarks/${bookmarkSlug}`;
  expect(pageUrls(bookmark)).toEqual({
    canonical: bookmarkPath,
    ogUrl: bookmarkPath,
  });

  const keystatic = await keystaticMetadata({
    params: Promise.resolve({ params: undefined }),
  });
  expect(pageUrls(keystatic)).toEqual({
    canonical: "/keystatic",
    ogUrl: "/keystatic",
  });

  const urls = [
    ...staticPages.map(([, metadata]) => pageUrls(metadata).canonical),
    postPath,
    bookmarkPath,
    "/keystatic",
  ];
  expect(new Set(urls).size).toBe(urls.length);
  expect(urls.filter((url) => url === "/").length).toBe(1);
});
