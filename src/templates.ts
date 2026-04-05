import type { Post, PostMeta, Page, PageMeta } from "./types.js";

function baseLayout(title: string, body: string, navPages: PageMeta[] = []): string {
  const navLinks = navPages.map((p) => `<a href="/${p.slug}">${p.title}</a>`).join("\n    ");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header>
    <nav><a href="/">Home</a>${navLinks ? `\n    ${navLinks}` : ""}</nav>
  </header>
  <main>${body}</main>
</body>
</html>`;
}

export function indexPage(posts: PostMeta[], navPages: PageMeta[] = []): string {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const items = sorted
    .map(
      (p) => `
    <article>
      <h2><a href="/p/${p.slug}">${p.title}</a></h2>
      <time datetime="${p.date}">${formatDate(p.date)}</time>
      ${p.description ? `<p>${p.description}</p>` : ""}
    </article>`
    )
    .join("\n");

  const body = `
    <h1>Posts</h1>
    ${items || "<p>No posts yet.</p>"}
  `;

  return baseLayout("Posts", body, navPages);
}

export function postPage(post: Post, navPages: PageMeta[] = []): string {
  const body = `
    <article>
      <header>
        <h1>${post.title}</h1>
        <time datetime="${post.date}">${formatDate(post.date)}</time>
      </header>
      <div class="content">${post.html}</div>
    </article>
  `;

  return baseLayout(post.title, body, navPages);
}

export function pagePage(page: Page, navPages: PageMeta[] = []): string {
  const body = `
    <article>
      <h1>${page.title}</h1>
      <div class="content">${page.html}</div>
    </article>
  `;

  return baseLayout(page.title, body, navPages);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
