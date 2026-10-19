import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getHomepageRevalidateSecret } from "@/lib/homepage-revalidate";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const expected = getHomepageRevalidateSecret();
  const provided = request.headers.get("authorization") ?? "";

  if (!expected || !authorizationMatches(provided, `Bearer ${expected}`)) {
    return new Response(null, { status: 404 });
  }

  revalidatePath("/");
  return new Response(null, { status: 204 });
}

function authorizationMatches(provided: string, expected: string) {
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  if (providedBytes.length !== expectedBytes.length) return false;
  return timingSafeEqual(providedBytes, expectedBytes);
}
