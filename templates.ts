// Shared pieces. Plain functions returning HTML strings — no template engine.
// `roots` are the URL prefixes that mark a link as the current section (posts live under /p/).
const links = [
  { href: "/", label: "Home", roots: [] },
  { href: "/posts", label: "Posts", roots: ["/posts", "/p"] },
  { href: "/bookmarks", label: "Bookmarks", roots: ["/bookmarks"] },
  { href: "/notes", label: "Notes", roots: ["/notes"] },
  { href: "/about", label: "About", roots: ["/about", "/cv"] },
];

const isActive = (path: string, l: (typeof links)[number]) =>
  l.href === "/" ? path === "/" : l.roots.some((r) => path === r || path.startsWith(`${r}/`));

export const nav = (path: string) => `<nav aria-label="Main">
${links
  .map((l, i) => `<a href="${l.href}"${isActive(path, l) ? ' aria-current="page"' : ""}><span class="n">${String(i + 1).padStart(2, "0")}</span> ${l.label}</a>`)
  .join("\n")}
</nav>`;

// BUILD_VERSION is the commit sha, set by the Docker build; local builds show "dev build".
export const footer = () => {
  const v = process.env.BUILD_VERSION;
  const notice = v
    ? `<a href="https://github.com/Plsr/website/commit/${v}">Release: ${v.slice(0, 7)}</a>`
    : "dev build";
  return `<footer>
<small>${notice}</small>
</footer>`;
};

export const head = (title: string) => `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="/style.css">`;

export const layout = (title: string, body: string, path: string) => `<!doctype html>
<html lang="en">
<head>
${head(`${title} — Chris Jarling`)}
</head>
<body>
${nav(path)}
<main>
${body}
</main>
${footer()}
</body>
</html>
`;
