import Redis, { RedisOptions } from 'ioredis';
import { env } from './env';
import { logger } from './logger';

let redisAvailable = false;
let connectPromise: Promise<void> | null = null;
let loggedFailure = false;
let loggedReconnect = false;
let loggedDisconnect = false;

function buildRedisOptions(overrides: RedisOptions = {}): RedisOptions {
  const base: RedisOptions = env.REDIS_URL
    ? {
        ...parseRedisUrl(env.REDIS_URL),
      }
    : {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD || undefined,
        db: env.REDIS_DB,
      };

  return {
    ...base,
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 1000,
    retryStrategy: (attempt) => {
      if (attempt > 5) return null;
      return Math.min(attempt * 200, 1000);
    },
    reconnectOnError: () => true,
    ...overrides,
  };
}

function parseRedisUrl(redisUrl: string): RedisOptions {
  const url = new URL(redisUrl);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    db: url.pathname ? Number(url.pathname.slice(1) || 0) : 0,
  };
}

export function getRedisOptions(overrides: RedisOptions = {}): RedisOptions {
  return buildRedisOptions(overrides);
}

export const redis = new Redis(getRedisOptions());

redis.on('connect', () => {
  logger.info('Redis Connected');
  loggedFailure = false;
  loggedReconnect = false;
  loggedDisconnect = false;
});

redis.on('ready', () => {
  redisAvailable = true;
});

redis.on('reconnecting', () => {
  redisAvailable = false;
  if (!loggedReconnect) {
    loggedReconnect = true;
    logger.warn('Redis Reconnecting');
  }
});

redis.on('end', () => {
  redisAvailable = false;
  if (!loggedDisconnect) {
    loggedDisconnect = true;
    logger.warn('Redis Disconnected');
  }
});

redis.on('close', () => {
  redisAvailable = false;
});

redis.on('error', (error) => {
  redisAvailable = false;
  if (!loggedFailure) {
    loggedFailure = true;
    logger.warn({ error: error.message }, 'Redis Connection Failed');
  }
});

export async function connectRedis(): Promise<void> {
  if (!env.REDIS_ENABLED) {
    redisAvailable = false;
    logger.warn('Redis disabled; continuing without cache and queues');
    return;
  }

  if (redis.status === 'ready') {
    redisAvailable = true;
    return;
  }

  if (!connectPromise) {
    connectPromise = redis
      .connect()
      .then(async () => {
        await redis.ping();
        redisAvailable = true;
      })
      .catch((error) => {
        redisAvailable = false;
        if (!loggedFailure) {
          loggedFailure = true;
          logger.warn({ error: error instanceof Error ? error.message : error }, 'Redis Connection Failed');
        }
      })
      .finally(() => {
        connectPromise = null;
      });
  }

  await connectPromise;
}

export async function disconnectRedis(): Promise<void> {
  if (redis.status === 'end') return;

  try {
    await redis.quit();
  } catch {
    redis.disconnect();
  } finally {
    redisAvailable = false;
  }
}

export async function checkRedisHealth(): Promise<boolean> {
  if (!env.REDIS_ENABLED || redis.status !== 'ready' || !redisAvailable) return false;

  try {
    return (await redis.ping()) === 'PONG';
  } catch (error) {
    redisAvailable = false;
    if (!loggedFailure) {
      loggedFailure = true;
      logger.warn({ error: error instanceof Error ? error.message : error }, 'Redis Connection Failed');
    }
    return false;
  }
}

export function isRedisReady(): boolean {
  return env.REDIS_ENABLED && redis.status === 'ready' && redisAvailable;
}
