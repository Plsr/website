import { createReader } from "@keystatic/core/reader";
import Link from "next/link";
import keystaticConfig from "@/keystatic.config";

const reader = createReader(process.cwd(), keystaticConfig);

export default async function PostsIndex() {
  const posts = await reader.collections.posts.all();

  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`}>{post.entry.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
