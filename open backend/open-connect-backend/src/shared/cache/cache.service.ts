import { redis, isRedisReady } from '../../config/redis';

export class CacheService {
  async get<T = unknown>(key: string): Promise<T | null> {
    if (!isRedisReady()) return null;

    try {
      const value = await redis.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!isRedisReady()) return;

    try {
      const payload = JSON.stringify(value);
      if (ttlSeconds) {
        await redis.set(key, payload, 'EX', ttlSeconds);
      } else {
        await redis.set(key, payload);
      }
    } catch {
      return;
    }
  }

  async del(key: string | string[]): Promise<void> {
    if (!isRedisReady()) return;

    const keys = Array.isArray(key) ? key : [key];
    if (keys.length === 0) return;

    try {
      await redis.del(...keys);
    } catch {
      return;
    }
  }

  async flush(): Promise<void> {
    if (!isRedisReady()) return;

    try {
      await redis.flushdb();
    } catch {
      return;
    }
  }
}

export const cacheService = new CacheService();
