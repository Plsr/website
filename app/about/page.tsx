import Link from "next/link";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-prose px-6 py-12 prose dark:prose-invert">
      <h1>About</h1>
      <p>
        I&rsquo;m Chris Jarling, an Engineering Manager at{" "}
        <a href="https://gigs.com">Gigs</a>. I&rsquo;m a husband and father of
        two daughters. Originally from Germany, recently relocated to Denmark.
      </p>
      <p>
        Rather than describe myself here, I&rsquo;d prefer you{" "}
        <Link href="/posts">explore the archives</Link> which is a more honest
        picture of who I am.
      </p>
      <p>
        For the professional version, see my <Link href="/cv">CV</Link>.
      </p>
      <h2>Reaching out</h2>
      <ul>
        <li>
          Email: <a href="mailto:hi@chrisjarling.com">hi@chrisjarling.com</a>
        </li>
        <li>
          LinkedIn:{" "}
          <a href="https://linkedin.com/in/chrispop/">
            linkedin.com/in/chrispop
          </a>
        </li>
      </ul>
      <p>
        I keep accounts on various other platforms too &mdash; activity varies
        by site.
      </p>
    </main>
  );
}
