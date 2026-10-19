import { getLogger } from "@logtape/logtape";
import { randomBytes } from "node:crypto";
import { setHomepageRevalidateSecret } from "@/lib/homepage-revalidate";

const logger = getLogger(["next-app", "contributions"]);

export function scheduleHomepageRevalidation() {
  const secret = randomBytes(32).toString("hex");
  setHomepageRevalidateSecret(secret);

  const port = process.env.PORT || "3000";
  const origin = `http://127.0.0.1:${port}`;
  let attempts = 0;

  const timer = setInterval(() => {
    attempts += 1;
    void warmHomepage(origin, secret, attempts, timer);
  }, 1000);

  timer.unref();
}

async function warmHomepage(
  origin: string,
  secret: string,
  attempt: number,
  timer: ReturnType<typeof setInterval>,
) {
  try {
    const revalidated = await fetch(`${origin}/api/internal/revalidate-homepage`, {
      method: "POST",
      headers: { authorization: `Bearer ${secret}` },
    });

    if (!revalidated.ok) {
      throw new Error(`revalidate route responded with HTTP ${revalidated.status}`);
    }

    clearInterval(timer);

    const homepage = await fetch(`${origin}/`);
    if (!homepage.ok) {
      logger.error("Homepage revalidation render failed", {
        status: homepage.status,
      });
      return;
    }

    logger.info("Refreshed the homepage after startup so the contribution graph can read the runtime token");
  } catch (error) {
    if (attempt >= 15) {
      clearInterval(timer);
      logger.error("Could not refresh the homepage after startup", {
        error: error instanceof Error ? error.message : "unknown error",
      });
    }
  }
}
