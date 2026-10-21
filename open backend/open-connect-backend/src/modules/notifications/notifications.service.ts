import { query } from '../../database/pool';
import { NotFoundError } from '../../shared/http/errors';
import { NotificationsRepository } from './notifications.repository';

/** Resolves the source table for each subscribable target and checks the row exists. */
const TARGET_TABLES: Record<string, string> = {
  eventId: 'events',
  liveSessionId: 'live_sessions',
};

async function assertTargetExists(body: { eventId?: string; liveSessionId?: string }) {
  for (const [key, table] of Object.entries(TARGET_TABLES)) {
    const id = (body as Record<string, string | undefined>)[key];
    if (!id) continue;
    const exists = await query<{ exists: boolean }>(`SELECT EXISTS (SELECT 1 FROM ${table} WHERE id=$1) AS exists`, [id]);
    if (exists.rows[0]?.exists !== true) throw new NotFoundError(`${key === 'eventId' ? 'Event' : 'Live session'} not found`);
  }
}

export const NotificationsService = {
  ...NotificationsRepository,
  subscribe: async (userId: string, body: { eventId?: string; liveSessionId?: string }) => {
    await assertTargetExists(body);
    const created = await NotificationsRepository.subscribe(userId, body);
    if (created) return created;
    // ON CONFLICT DO NOTHING means an identical subscription already exists; return it.
    const existing = await query(
      'SELECT * FROM notification_subscriptions WHERE user_id=$1 AND ((event_id=$2 AND live_session_id IS NULL) OR (live_session_id=$3 AND event_id IS NULL)) LIMIT 1',
      [userId, body.eventId ?? null, body.liveSessionId ?? null],
    );
    if (!existing.rows.length) throw new NotFoundError('Subscription target not found');
    return existing.rows[0];
  },
  read: async (userId: string, id: string) => {
    const row = await NotificationsRepository.read(userId, id);
    if (!row) throw new NotFoundError('Notification not found');
    return row;
  },
};
