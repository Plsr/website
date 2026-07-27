import { createReader } from "@keystatic/core/reader";
import Link from "next/link";
import keystaticConfig from "@/keystatic.config";

const reader = createReader(process.cwd(), keystaticConfig);

const featuredSlugs = [
  "2025-07-27-how-to-split-big-pull-requests",
  "2025-07-20-approving-by-default",
  "2024-09-09-relocating-denmark",
  "2019-05-17-chestertons-fence",
];

export default async function Home() {
  const featured = (
    await Promise.all(
      featuredSlugs.map(async (slug) => {
        const entry = await reader.collections.posts.read(slug);
        return entry ? { slug, entry } : null;
      }),
    )
  ).filter(
    (
      post,
    ): post is { slug: string; entry: NonNullable<typeof post>["entry"] } =>
      post !== null,
  );

  return (
    <main className="mx-auto w-full max-w-prose px-6 py-24">
      <section className="prose dark:prose-invert mb-16">
        <h1 className="text-3xl font-normal">Hi, I&rsquo;m Chris.</h1>
        <p>
          I&rsquo;m an engineering manager at Gigs, where we&rsquo;re building
          the operating system for telecom. Before stepping into management, I
          spent 10+ years as a fullstack engineer but even today prefer to stay
          technical and hands-on where possible. Lately I&rsquo;m especially
          interested in how to apply AI to the work we do every day.
        </p>
        <p>
          I&rsquo;m currently based in Copenhagen.{" "}
          <Link href="/about">More about me →</Link>
        </p>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Favorite writing</h2>
          <Link
            href="/posts"
            className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
          >
            All posts →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {featured.map((post) => (
            <Link
              key={post.slug}
              href={`/p/${post.slug}`}
              className="group relative flex flex-col gap-1.5 rounded-xl border border-surface-border bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] dark:shadow-none dark:hover:bg-zinc-900/60"
            >
              <time
                className="font-mono text-xs tabular-nums text-gray-500 uppercase tracking-wide"
                dateTime={post.entry.date}
              >
                {new Date(post.entry.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
              <h3 className="text-balance line-clamp-2 min-h-[3.1rem] font-serif text-lg leading-snug">
                {post.entry.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
