import { query } from '../../database/pool';
import { addQueueJob } from '../../queues';
import { NotFoundError } from '../../shared/http/errors';
import { ReportsRepository } from './reports.repository';

/** Every reportable target type must reference a real row before the report is filed. */
const TARGET_TABLES: Record<string, string> = {
  song: 'songs',
  podcast: 'podcasts',
  episode: 'podcast_episodes',
  station: 'radio_stations',
  rj: 'rjs',
  message: 'live_chat_messages',
};

export const ReportsService = {
  create: async (u: string, b: any) => {
    const table = TARGET_TABLES[b.targetType as string];
    if (table) {
      const exists = await query<{ exists: boolean }>(`SELECT EXISTS (SELECT 1 FROM ${table} WHERE id=$1) AS exists`, [b.targetId]);
      if (exists.rows[0]?.exists !== true) throw new NotFoundError(`Report target (${b.targetType}) not found`);
    }
    const r = await ReportsRepository.create(u, b);
    await addQueueJob('report.queue', 'review', { reportId: r.id });
    return r;
  },
  request: ReportsRepository.request,
};
