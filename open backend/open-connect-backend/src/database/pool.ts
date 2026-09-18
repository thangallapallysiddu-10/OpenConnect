import { Pool, PoolClient, QueryResultRow } from 'pg';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (error: Error) => logger.error({ error }, 'Unexpected PostgreSQL pool error'));

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  return pool.query<T>(text, values);
}

export async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const value = await work(client);
    await client.query('COMMIT');
    return value;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
