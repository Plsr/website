import type { Post, PostMeta, Page, PageMeta, Link } from "./types.js";

function baseLayout(title: string, body: string, navPages: PageMeta[] = []): string {
  const navLinks = [
    `<a href="/links">Links</a>`,
    ...navPages.map((p) => `<a href="/${p.slug}">${p.title}</a>`),
  ].join("\n    ");
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
    <nav>
      <a href="/" class="site-name">Chris Jarling</a>
      <div class="nav-links">${navLinks}</div>
    </nav>
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
    <li class="post-row">
      <a href="/p/${p.slug}">${p.title}</a>
      <span class="dots"></span>
      <time datetime="${p.date}">${formatDate(p.date)}</time>
    </li>`
    )
    .join("\n");

  const body = `
    <ul class="post-list">
      ${items || "<li>No posts yet.</li>"}
    </ul>
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

export function linksPage(links: Link[], navPages: PageMeta[] = []): string {
  const sorted = [...links].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const items = sorted
    .map(
      (l) => `
    <article class="link-entry">
      <header>
        <h2><a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.title}</a></h2>
        <div class="link-meta">
          <time datetime="${l.date}">${formatDate(l.date)}</time>
          <a href="/links/${l.slug}" class="permalink">permalink</a>
        </div>
      </header>
      ${l.html ? `<div class="content">${l.html}</div>` : ""}
    </article>`
    )
    .join("\n");

  const body = `
    <div class="link-feed">
      ${items || "<p>No links yet.</p>"}
    </div>
  `;

  return baseLayout("Links", body, navPages);
}

export function linkPage(link: Link, navPages: PageMeta[] = []): string {
  const body = `
    <article class="link-entry">
      <header>
        <h1><a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.title}</a></h1>
        <div class="link-meta">
          <time datetime="${link.date}">${formatDate(link.date)}</time>
          <a href="/links/${link.slug}" class="permalink">permalink</a>
        </div>
      </header>
      <div class="content">${link.html}</div>
    </article>
  `;

  return baseLayout(link.title, body, navPages);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
