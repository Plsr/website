import "server-only";
import { cookies } from "next/headers";
import keystaticConfig from "@/keystatic.config";

/**
 * Whether the current request comes from someone allowed to edit the site.
 *
 * Reuses the Keystatic GitHub session: the access token Keystatic stores in a
 * cookie must belong to a user with push access to the content repo. In local
 * storage mode (development only) everyone is allowed, same as Keystatic.
 */
export async function isAdmin(): Promise<boolean> {
  const { storage } = keystaticConfig;
  if (storage.kind === "local") return true;
  if (storage.kind !== "github") return false;

  const token = (await cookies()).get("keystatic-gh-access-token")?.value;
  if (!token) return false;

  const repo =
    typeof storage.repo === "string"
      ? storage.repo
      : `${storage.repo.owner}/${storage.repo.name}`;

  const response = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!response.ok) return false;

  const body: { permissions?: { push?: boolean } } = await response.json();
  return body.permissions?.push === true;
}

/** For server actions, which are reachable by direct POST. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}
