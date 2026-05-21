import { createReader } from "@keystatic/core/reader";
import Link from "next/link";
import keystaticConfig from "@/keystatic.config";

const reader = createReader(process.cwd(), keystaticConfig);

export default async function PostsIndex() {
  const posts = await reader.collections.posts.all();
  const sorted = posts
    .filter((post) => !post.entry.hidden)
    .sort((a, b) => (a.entry.date < b.entry.date ? 1 : -1));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Posts</h1>
      <ul className="space-y-2">
        {sorted.map((post) => (
          <li key={post.slug} className="flex flex-col sm:flex-row sm:gap-4">
            <Link href={`/posts/${post.slug}`} className="sm:order-2">
              {post.entry.title}
            </Link>
            <time
              className="text-sm text-gray-500 sm:order-1 sm:w-28 sm:shrink-0 sm:text-base"
              dateTime={post.entry.date}
            >
              {post.entry.date}
            </time>
          </li>
        ))}
      </ul>
    </main>
  );
}
