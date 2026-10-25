import { createRequire } from "node:module";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import nextConfig from "../next.config";

const require = createRequire(import.meta.url);
const { pathToRegexp, regexpToFunction, compile } = require(
  "next/dist/compiled/path-to-regexp",
) as {
  pathToRegexp: (
    path: string,
    keys: { name: string | number }[],
    options: { delimiter: string; sensitive: boolean; strict: boolean },
  ) => RegExp;
  regexpToFunction: (
    re: RegExp,
    keys: { name: string | number }[],
  ) => (
    pathname: string,
  ) => false | { params: Record<string, string> };
  compile: (
    path: string,
  ) => (params: Record<string, string>) => string;
};
const { modifyRouteRegex } = require("next/dist/lib/redirect-status") as {
  modifyRouteRegex: (regex: string, restrictedPaths?: string[]) => string;
};

type RedirectRule = {
  source: string;
  destination: string;
  permanent?: boolean;
};

// Same compilation Next uses for next.config redirects: path-to-regexp with
// strict matching, then an optional trailing slash and a /_next guard.
function matchRule(source: string, pathname: string) {
  const keys: { name: string | number }[] = [];
  const regexp = pathToRegexp(source, keys, {
    delimiter: "/",
    sensitive: false,
    strict: true,
  });
  const modified = new RegExp(
    modifyRouteRegex(regexp.source, ["/_next"]),
    regexp.flags,
  );
  return regexpToFunction(modified, keys)(pathname);
}

function resolveFirst(rules: RedirectRule[], pathname: string) {
  for (const rule of rules) {
    const match = matchRule(rule.source, pathname);
    if (!match) continue;
    return {
      source: rule.source,
      permanent: rule.permanent,
      destination: compile(rule.destination)(match.params),
    };
  }
  return null;
}

const postsDir = path.join(process.cwd(), "content/posts");

function contentFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...contentFiles(full));
    } else if (/\.(mdoc|md|mdx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

test("dated post filenames are gone and clean slugs are not redirected", async () => {
  const files = readdirSync(postsDir).filter((file) => file.endsWith(".mdoc"));
  expect(files).toHaveLength(85);
  expect(files.filter((file) => /^\d{4}-\d{2}-\d{2}-/.test(file))).toEqual([]);
  expect(files).toContain("34.mdoc");

  const rules = (await nextConfig.redirects?.()) as RedirectRule[];
  for (const file of files) {
    const slug = file.replace(/\.mdoc$/, "");
    expect(resolveFirst(rules, `/p/${slug}`)).toBeNull();
  }
});

test("old post URLs redirect to the final slug in one hop", async () => {
  const rules = (await nextConfig.redirects?.()) as RedirectRule[];
  expect(rules.map((rule) => rule.source)).toEqual([
    "/posts/relocating-denark",
    "/p/:date(\\d{4}-\\d{2}-\\d{2})-:slug([^/]+)",
    "/posts/:date(\\d{4}-\\d{2}-\\d{2})-:slug([^/]+)",
    "/posts/:slug([^/]+)",
  ]);
  expect(rules.every((rule) => rule.permanent)).toBe(true);

  const cases: [string, string][] = [
    ["/p/2023-05-07-fatigue", "/p/fatigue"],
    ["/posts/2023-05-07-fatigue", "/p/fatigue"],
    ["/p/2023-01-14-redesign-3", "/p/redesign-3"],
    ["/posts/2023-01-14-redesign-3", "/p/redesign-3"],
    ["/posts/transition-management", "/p/transition-management"],
    ["/posts/relocating-denark", "/p/relocating-denmark"],
    [
      "/p/2025-07-27-how-to-split-big-pull-requests",
      "/p/how-to-split-big-pull-requests",
    ],
    ["/p/2024-09-09-relocating-denmark", "/p/relocating-denmark"],
    ["/posts/2024-09-09-relocating-denmark", "/p/relocating-denmark"],
    ["/p/2025-07-22-34", "/p/34"],
    ["/posts/work-ethic", "/p/work-ethic"],
  ];

  for (const [from, to] of cases) {
    const hit = resolveFirst(rules, from);
    expect(hit?.destination, from).toBe(to);
    expect(resolveFirst(rules, to), `${from} second hop`).toBeNull();
  }

  expect(resolveFirst(rules, "/p/34")).toBeNull();
  expect(resolveFirst(rules, "/posts")).toBeNull();
  expect(resolveFirst(rules, "/p/work-ethic")).toBeNull();
  expect(resolveFirst(rules, "/p/2023-review")).toBeNull();
  expect(resolveFirst(rules, "/posts/2023-review")?.destination).toBe(
    "/p/2023-review",
  );
});

test("content links point at final pages, not old slugs or dead URLs", () => {
  const stale = [
    /https?:\/\/www\.chrisjarling\.com/,
    /https?:\/\/(?:www\.)?chrisjarling\.com\/posts\//,
    /https?:\/\/(?:www\.)?chrisjarling\.com\/p\/\d{4}-\d{2}-\d{2}-/,
    /\]\(\/posts\//,
    /\]\(\/p\/\d{4}-\d{2}-\d{2}-/,
    /digital-garden/,
    /library\/articles/,
    /tools\/json-formatter/,
  ];

  const offenders: string[] = [];
  for (const file of contentFiles(path.join(process.cwd(), "content"))) {
    const text = readFileSync(file, "utf8");
    for (const pattern of stale) {
      if (pattern.test(text)) {
        offenders.push(`${path.relative(process.cwd(), file)} matches ${pattern}`);
      }
    }
  }
  expect(offenders).toEqual([]);

  const review = readFileSync(
    path.join(postsDir, "2023-review.mdoc"),
    "utf8",
  );
  expect(review).toContain("](/p/redesign-3)");
  expect(review).toContain("](/p/fatigue)");
  expect(review).toContain("](/p/ergodox)");
  expect(review).toContain("](/p/unpublished-writing)");
  expect(review).toContain("](/notes)");
  expect(review).toContain("](/bookmarks)");

  const wrapped = readFileSync(
    path.join(postsDir, "2024-wrapped.mdoc"),
    "utf8",
  );
  expect(wrapped).toContain("](/p/relocating-denmark)");
  expect(wrapped).toContain("](/p/transition-management)");

  expect(
    readFileSync(path.join(postsDir, "end-of-hsitory-illusion.mdoc"), "utf8"),
  ).toContain("](/p/goals)");
  expect(
    readFileSync(path.join(postsDir, "casey-neistat-notebooks.mdoc"), "utf8"),
  ).toContain("](/p/precious-time)");

  const page = readFileSync(path.join(process.cwd(), "app/page.tsx"), "utf8");
  for (const slug of [
    "how-to-split-big-pull-requests",
    "approving-by-default",
    "relocating-denmark",
    "chestertons-fence",
  ]) {
    expect(page).toContain(`"${slug}"`);
    expect(
      statSync(path.join(postsDir, `${slug}.mdoc`)).isFile(),
    ).toBe(true);
  }
  expect(page).not.toMatch(/"\d{4}-\d{2}-\d{2}-/);
});
