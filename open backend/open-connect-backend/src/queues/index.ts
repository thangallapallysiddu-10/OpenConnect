import { Queue } from 'bullmq';
import { logger } from '../config/logger';
import { canUseQueues, closeQueueConnection, queueConnection } from './connection';

type QueueName = 'notification.queue' | 'email.queue' | 'report.queue';
type QueueMap = Record<QueueName, Queue>;

let queues: QueueMap | null = null;

const options = {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential' as const, delay: 1000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
};

function getQueues(): QueueMap | null {
  if (!canUseQueues()) return null;
  if (queues) return queues;

  queues = {
    'notification.queue': new Queue('notification.queue', options),
    'email.queue': new Queue('email.queue', options),
    'report.queue': new Queue('report.queue', options),
  };

  Object.values(queues).forEach((queue) => {
    queue.on('error', (error) => logger.warn({ queue: queue.name, error: error.message }, 'Redis Connection Failed'));
  });

  return queues;
}

export async function addQueueJob(
  queueName: QueueName,
  name: string,
  data: unknown,
): Promise<void> {
  const activeQueues = getQueues();
  if (!activeQueues) {
    logger.warn({ queue: queueName, job: name }, 'Redis unavailable; skipping background job');
    return;
  }

  try {
    await activeQueues[queueName].add(name, data as never);
  } catch (error) {
    logger.warn({ queue: queueName, job: name, error }, 'Redis Connection Failed');
  }
}

export async function closeQueues(): Promise<void> {
  if (queues) {
    await Promise.allSettled(Object.values(queues).map((queue) => queue.close()));
    queues = null;
  }
  await closeQueueConnection();
}
