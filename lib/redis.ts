import "server-only";
import { getLogger } from "@logtape/logtape";
import { createClient } from "redis";

const logger = getLogger(["next-app", "redis"]);

type RedisClient = ReturnType<typeof createClient>;

// Reuse one connection per server process (and across dev hot reloads).
const globalForRedis = globalThis as unknown as {
  redisClient?: Promise<RedisClient> | null;
};

/**
 * Returns a connected Redis client, or `null` when `REDIS_URL` isn't set.
 * Commands fail fast instead of queueing while the connection is down, so a
 * Redis outage can't hang page renders.
 */
export function getRedis(): Promise<RedisClient> | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  if (!globalForRedis.redisClient) {
    const client = createClient({
      url,
      disableOfflineQueue: true,
      socket: { connectTimeout: 2000 },
    });
    client.on("error", (error) => {
      logger.warn("Redis client error: {error}", { error });
    });
    globalForRedis.redisClient = client.connect().catch((error) => {
      // Allow the next call to retry instead of caching the failure.
      globalForRedis.redisClient = null;
      client.destroy();
      throw error;
    });
  }

  return globalForRedis.redisClient;
}
