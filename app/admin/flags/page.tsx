import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/admin-auth";
import { listFlags } from "@/lib/flags";
import { resetFlagAction, toggleFlagAction } from "./actions";

export const metadata: Metadata = {
  title: "Feature flags",
  robots: { index: false, follow: false },
};

export default async function FlagsPage() {
  if (!(await isAdmin())) {
    return (
      <main className="mx-auto w-full max-w-prose px-6 py-24 prose dark:prose-invert">
        <h1>Feature flags</h1>
        <p>
          Sign in to <Link href="/keystatic">Keystatic</Link> with GitHub, then
          come back to this page.
        </p>
      </main>
    );
  }

  const { flags, redisAvailable } = await listFlags();

  return (
    <main className="mx-auto w-full max-w-prose px-6 py-24">
      <h1 className="mb-2 text-3xl font-normal">Feature flags</h1>
      <p className="mb-8 text-sm text-gray-500">
        Add or remove flags in <code>feature-flags.json</code>.
      </p>

      {!redisAvailable && (
        <p className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          Redis is not configured or unreachable. Every flag uses its default
          and flags can&rsquo;t be changed.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {flags.map(({ name, description, defaultValue, override, enabled }) => (
          <li
            key={name}
            className="flex items-center justify-between gap-4 rounded-xl border border-surface-border bg-surface p-4"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <code className="font-mono text-sm">{name}</code>
              {description && (
                <p className="text-sm text-gray-500">{description}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {override === undefined ? (
                  <span>Default ({defaultValue ? "on" : "off"})</span>
                ) : (
                  <>
                    <span>
                      Overridden, default is {defaultValue ? "on" : "off"}
                    </span>
                    <form action={resetFlagAction}>
                      <input type="hidden" name="name" value={name} />
                      <button
                        type="submit"
                        className="underline hover:text-foreground"
                      >
                        Reset
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
            <form action={toggleFlagAction}>
              <input type="hidden" name="name" value={name} />
              <input type="hidden" name="value" value={enabled ? "off" : "on"} />
              <button
                type="submit"
                disabled={!redisAvailable}
                aria-label={`Turn ${name} ${enabled ? "off" : "on"}`}
                className={`w-16 shrink-0 rounded-full px-3 py-1 font-mono text-sm transition-colors disabled:opacity-50 ${
                  enabled
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
                }`}
              >
                {enabled ? "On" : "Off"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
