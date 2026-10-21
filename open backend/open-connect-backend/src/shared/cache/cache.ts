import { redis, isRedisReady } from '../../config/redis';
import { cacheService } from './cache.service';

export async function cacheAside<T>(
  key: string,
  ttlSeconds: number,
  load: () => Promise<T>,
): Promise<T> {
  const cached = await cacheService.get<T>(key);
  if (cached !== null) return cached;

  const value = await load();

  await cacheService.set(key, value, ttlSeconds);

  return value;
}

export async function invalidateByPrefix(prefix: string): Promise<void> {
  if (!isRedisReady()) return;
  const stream = redis.scanStream({ match: `${prefix}*`, count: 100 });
  for await (const keys of stream) {
    const batch = keys as string[];
    await cacheService.del(batch);
  }
}
