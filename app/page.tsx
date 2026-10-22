import { createReader } from "@keystatic/core/reader";
import Link from "next/link";
import keystaticConfig from "@/keystatic.config";
import { BuiltProjects } from "@/components/built-projects";
import { RuledList, RuledRow } from "@/components/ruled-list";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { IntroMeta } from "@/components/intro-meta";

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
        <h1 className="text-balance text-3xl font-normal leading-tight">
          I lead engineering teams at Gigs, building the OS for embedded telecom.
        </h1>
        <p>
          I spent 10+ years as a fullstack engineer before moving into
          management, and I still stay hands-on and close to the code. I
          believe in tough conversations, held with care and courage, to build
          high-performing teams. Lately I&rsquo;m most interested in how AI
          changes the way we build.
        </p>
        <IntroMeta />
      </section>

      <BuiltProjects />

      <RevealOnScroll>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Favorite writing</h2>
          <Link
            href="/essays"
            className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
          >
            All essays →
          </Link>
        </div>
        <RuledList className="featured-writing-grid">
          {featured.map((post) => (
            <RuledRow
              key={post.slug}
              title={post.entry.title}
              meta={new Date(post.entry.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              })}
              dateTime={post.entry.date}
              href={`/p/${post.slug}`}
            />
          ))}
        </RuledList>
      </RevealOnScroll>
    </main>
  );
}
