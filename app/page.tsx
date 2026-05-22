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
    <main className="mx-auto max-w-prose px-6 py-24">
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
        <h2 className="mb-4 text-xl font-semibold">Favorite writing</h2>
        <ul className="space-y-2">
          {featured.map((post) => (
            <li key={post.slug} className="flex flex-col sm:flex-row sm:gap-4">
              <Link href={`/posts/${post.slug}`} className="sm:order-2">
                {post.entry.title}
              </Link>
              <time
                className="text-sm text-gray-500 sm:order-1 sm:w-28 sm:shrink-0 sm:text-base"
                dateTime={post.entry.date}
              >
                {new Date(post.entry.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Link
            href="/posts"
            className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
          >
            All posts →
          </Link>
        </div>
      </section>
    </main>
  );
}
