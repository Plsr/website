import Link from "next/link";

export function Navigation() {
  return (
    <nav className="flex gap-2">
      <p>About</p>
      <p>Now</p>
      <Link href="/posts">Posts</Link>
      <p>Links</p>
    </nav>
  );
}
