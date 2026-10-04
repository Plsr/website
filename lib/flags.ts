import "server-only";
import { getLogger } from "@logtape/logtape";
import { connection } from "next/server";
import flagDefaults from "@/feature-flags.json";
import { getRedis } from "@/lib/redis";

const logger = getLogger(["next-app", "flags"]);

// Hash of flag name → "1" | "0". Only flags toggled in /admin/flags have an
// entry; the rest use their default from feature-flags.json.
const REDIS_KEY = "feature-flags";

/**
 * Every flag that exists. feature-flags.json is the registry: a flag must be
 * declared there, with a default, before it can be read or toggled.
 */
export type FlagName = keyof typeof flagDefaults;

export type Flag = {
  name: FlagName;
  description: string;
  defaultValue: boolean;
  /** The value set in /admin/flags, or `undefined` if using the default. */
  override: boolean | undefined;
  enabled: boolean;
};

export function isFlagName(name: string): name is FlagName {
  return Object.hasOwn(flagDefaults, name);
}

function assertFlagName(name: string): asserts name is FlagName {
  if (!isFlagName(name)) {
    throw new Error(
      `Unknown feature flag "${name}". Declare it in feature-flags.json.`,
    );
  }
}

/**
 * Reads the overrides stored in Redis, ignoring names that aren't declared.
 * Returns `null` when Redis isn't configured or reachable.
 */
async function readOverrides(): Promise<Partial<
  Record<FlagName, boolean>
> | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const stored = await (await redis).hGetAll(REDIS_KEY);
    return Object.fromEntries(
      Object.entries(stored)
        .filter(([name]) => isFlagName(name))
        .map(([name, value]) => [name, value === "1"]),
    );
  } catch (error) {
    logger.warn("Could not read feature flags, using defaults: {error}", {
      error,
    });
    return null;
  }
}

/**
 * Returns every declared flag sorted by name, plus whether Redis could be
 * read. Without Redis, every flag has its default value.
 */
export async function listFlags(): Promise<{
  flags: Flag[];
  redisAvailable: boolean;
}> {
  const overrides = await readOverrides();
  const flags = (Object.keys(flagDefaults) as FlagName[])
    .sort()
    .map((name) => {
      const { default: defaultValue, description } = flagDefaults[name];
      const override = overrides?.[name];
      return {
        name,
        description,
        defaultValue,
        override,
        enabled: override ?? defaultValue,
      };
    });
  return { flags, redisAvailable: overrides !== null };
}

/**
 * Whether a flag is on: the value set in /admin/flags, or the default from
 * feature-flags.json when it was never set or Redis is down. Throws for
 * flags that aren't declared. Pages that call this are rendered per request
 * instead of being prerendered at build time.
 */
export async function getFlag(name: FlagName): Promise<boolean> {
  assertFlagName(name);
  await connection();
  const fallback = flagDefaults[name].default;

  const redis = getRedis();
  if (!redis) return fallback;

  try {
    const value = await (await redis).hGet(REDIS_KEY, name);
    return value == null ? fallback : value === "1";
  } catch (error) {
    logger.warn("Could not read feature flag {name}, using default: {error}", {
      name,
      error,
    });
    return fallback;
  }
}

async function requireRedis() {
  const redis = getRedis();
  if (!redis) throw new Error("REDIS_URL is not configured");
  return redis;
}

export async function setFlag(name: string, enabled: boolean): Promise<void> {
  assertFlagName(name);
  await (await requireRedis()).hSet(REDIS_KEY, name, enabled ? "1" : "0");
}

/** Removes the override so the flag goes back to its default. */
export async function resetFlag(name: string): Promise<void> {
  assertFlagName(name);
  await (await requireRedis()).hDel(REDIS_KEY, name);
}
