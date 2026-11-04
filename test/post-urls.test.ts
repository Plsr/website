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
  has?: ReadonlyArray<{ type: string; value?: string }>;
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

function appliesToHost(rule: RedirectRule, host: string) {
  for (const condition of rule.has ?? []) {
    if (
      condition.type === "host" &&
      condition.value?.toLowerCase() !== host.toLowerCase()
    ) {
      return false;
    }
  }
  return true;
}

function resolveFirst(
  rules: RedirectRule[],
  pathname: string,
  host = "chrisjarling.com",
) {
  for (const rule of rules) {
    if (!appliesToHost(rule, host)) continue;
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
    "/:path*",
    "/posts/relocating-denark",
    "/p/:date(\\d{4}-\\d{2}-\\d{2})-:slug([^/]+)",
    "/posts/:date(\\d{4}-\\d{2}-\\d{2})-:slug([^/]+)",
    "/posts/:slug([^/]+)",
  ]);
  expect(rules[0]?.has).toEqual([
    { type: "host", value: "www.chrisjarling.com" },
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

// Fenced and inline code can mention old paths without linking to them.
function stripCode(text: string): string {
  const lines = text.split("\n");
  const kept: string[] = [];
  let fence: { char: string; size: number } | null = null;
  for (const line of lines) {
    const marker = /^(?: {0,3})(`{3,}|~{3,})/.exec(line);
    if (marker) {
      const token = marker[1];
      if (!fence) {
        fence = { char: token[0], size: token.length };
        continue;
      }
      if (
        token[0] === fence.char &&
        token.length >= fence.size &&
        line.trim() === token
      ) {
        fence = null;
        continue;
      }
    }
    if (!fence) kept.push(line);
  }
  return kept.join("\n").replace(/`[^`\n]*`/g, "");
}

function linkDestinations(text: string): string[] {
  const source = stripCode(text);
  const destinations: string[] = [];

  for (let i = 0; i < source.length; i++) {
    if (source[i] !== "]" || source[i + 1] !== "(") continue;
    let start = i + 2;
    while (source[start] === " " || source[start] === "\n") start++;
    if (source[start] === "<") {
      const close = source.indexOf(">", start + 1);
      if (close === -1) continue;
      destinations.push(source.slice(start + 1, close).trim());
      i = close;
      continue;
    }
    let end = start;
    while (
      end < source.length &&
      source[end] !== ")" &&
      source[end] !== " " &&
      source[end] !== "\n"
    ) {
      end++;
    }
    if (end > start) destinations.push(source.slice(start, end));
    i = end;
  }

  const reference =
    /^\s{0,3}\[[^\]]+\]:[ \t]*<?([^\s>]+)>?[ \t]*(?:(?:"[^"]*"|'[^']*')[ \t]*)?$/gm;
  for (const match of source.matchAll(reference)) {
    destinations.push(match[1]);
  }

  const autolink = /<(https?:\/\/[^>\s]+)>/g;
  for (const match of source.matchAll(autolink)) {
    destinations.push(match[1]);
  }

  const href =
    /\bhref\s*=\s*(?:\{\s*(["'`])([\s\S]*?)\1\s*\}|(["'])([\s\S]*?)\3)/g;
  for (const match of source.matchAll(href)) {
    destinations.push(match[2] ?? match[4]);
  }

  return destinations;
}

function staleDestination(destination: string): boolean {
  const trimmed = destination.trim();
  if (!trimmed || trimmed.startsWith("#") || /^(mailto|tel):/i.test(trimmed)) {
    return false;
  }
  let url: URL;
  try {
    url = new URL(trimmed, "https://chrisjarling.com");
  } catch {
    return false;
  }
  const internal =
    trimmed.startsWith("/") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../") ||
    url.hostname === "chrisjarling.com" ||
    url.hostname === "www.chrisjarling.com";
  if (!internal) return false;
  if (url.hostname === "www.chrisjarling.com") return true;

  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  if (pathname.startsWith("/posts/")) return true;
  if (/^\/p\/\d{4}-\d{2}-\d{2}-/.test(pathname)) return true;
  return (
    pathname === "/digital-garden" ||
    pathname.startsWith("/digital-garden/") ||
    pathname === "/library/articles" ||
    pathname.startsWith("/library/articles/") ||
    pathname === "/tools/json-formatter" ||
    pathname.startsWith("/tools/json-formatter/")
  );
}

test("prose and code may mention retired paths", () => {
  const sample = [
    "The old digital-garden and library/articles pages are gone.",
    "```",
    "library/articles",
    'href="/digital-garden"',
    "[formatter](/tools/json-formatter)",
    "```",
    "A real [garden](/digital-garden) still counts.",
    'See <a href="/library/articles">notes</a>.',
  ].join("\n");

  expect(linkDestinations(sample).filter(staleDestination)).toEqual([
    "/digital-garden",
    "/library/articles",
  ]);
});

test("content links point at final pages, not old slugs or dead URLs", () => {
  const offenders: string[] = [];
  for (const file of contentFiles(path.join(process.cwd(), "content"))) {
    const text = readFileSync(file, "utf8");
    for (const destination of linkDestinations(text)) {
      if (staleDestination(destination)) {
        offenders.push(
          `${path.relative(process.cwd(), file)} links to ${destination}`,
        );
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
