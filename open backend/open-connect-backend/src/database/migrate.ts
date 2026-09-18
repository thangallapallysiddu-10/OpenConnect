import fs from 'node:fs/promises';
import path from 'node:path';
import { pool, transaction } from './pool';

async function run() {
  await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz DEFAULT now())');
  const directory = path.join(__dirname, 'migrations');
  const files = (await fs.readdir(directory)).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const done = await pool.query('SELECT 1 FROM schema_migrations WHERE name=$1', [file]);
    if (done.rowCount) continue;
    const sql = await fs.readFile(path.join(directory, file), 'utf8');
    await transaction(async (client) => { await client.query(sql); await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [file]); });
    console.log(`Applied ${file}`);
  }
  await pool.end();
}
run().catch((error) => { console.error(error); process.exit(1); });
