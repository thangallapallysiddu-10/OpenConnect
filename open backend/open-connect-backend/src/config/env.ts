import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default('0.0.0.0'),
  API_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z.string().default('postgresql://openconnect:openconnect_secret@localhost:5432/openconnect'),
  DATABASE_SSL: z.string().default('false').transform((v) => v === 'true'),
  DB_POOL_MAX: z.coerce.number().int().min(1).default(20),
  REDIS_ENABLED: z.string().default('true').transform((v) => v !== 'false'),
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().default(''),
  REDIS_DB: z.coerce.number().int().min(0).default(0),
  JWT_ACCESS_SECRET: z.string().min(32).default('development-access-secret-change-me-now'),
  JWT_REFRESH_SECRET: z.string().min(32).default('development-refresh-secret-change-me-now'),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.string().default('info'),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(300),
});

export const env = schema.parse(process.env);
export const isProduction = env.NODE_ENV === 'production';
