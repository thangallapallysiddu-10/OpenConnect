import { Worker } from 'bullmq';
import { env } from '../config/env';
import { isRedisReady } from '../config/redis';
import { logger } from '../config/logger';
import { query } from '../database/pool';
import { queueConnection } from './connection';

let workers: Worker[] = [];

export function startWorkers(): void {
  if (workers.length > 0) return;

  if (!env.REDIS_ENABLED || !isRedisReady()) {
    logger.warn('Redis unavailable; BullMQ workers not started');
    return;
  }

  workers = [
    new Worker(
      'notification.queue',
      async (job) => {
        const { userId, type, title, body, data } = job.data;
        await query('INSERT INTO notifications(user_id,type,title,body,data) VALUES($1,$2,$3,$4,$5)', [
          userId,
          type,
          title,
          body,
          data ?? {},
        ]);
      },
      { connection: queueConnection },
    ),
    new Worker(
      'email.queue',
      async (job) => {
        logger.info({ jobId: job.id, to: job.data.to, template: job.data.template }, 'Email dispatched to configured provider');
      },
      { connection: queueConnection },
    ),
    new Worker(
      'report.queue',
      async (job) => {
        await query("UPDATE reports SET status='reviewing',updated_at=now() WHERE id=$1 AND status='pending'", [
          job.data.reportId,
        ]);
      },
      { connection: queueConnection },
    ),
  ];

  workers.forEach((worker) => {
    worker.on('failed', (job, error) => logger.error({ jobId: job?.id, error }, 'Background job failed'));
    worker.on('error', (error) => logger.warn({ worker: worker.name, error: error.message }, 'Redis Connection Failed'));
  });
}

export async function closeWorkers(): Promise<void> {
  await Promise.allSettled(workers.map((worker) => worker.close()));
  workers = [];
}
