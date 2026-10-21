import type { ConnectionOptions } from 'bullmq';
import { env } from '../config/env';
import { getRedisOptions, isRedisReady } from '../config/redis';

export const queueConnection = getRedisOptions({
  connectionName: 'open-connect-bullmq',
  maxRetriesPerRequest: null,
}) as ConnectionOptions;

export function canUseQueues(): boolean {
  return env.REDIS_ENABLED && isRedisReady();
}

export async function closeQueueConnection(): Promise<void> {
  return;
}
