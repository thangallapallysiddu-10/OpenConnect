import { readFileSync, writeFileSync, existsSync } from 'fs';
import { randomBytes } from 'crypto';
import { resolve } from 'path';

interface LocalConfig {
  app: { port: number; apiPrefix: string; nodeEnv: string };
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
    schema: string;
  };
  redis: { host: string; port: number };
  jwt: { accessExpiresIn: string; refreshExpiresIn: string };
  security: {
    bcryptRounds: number;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
  };
  logging: { level: string };
  test: {
    port: number;
    bcryptRounds: number;
    rateLimitMaxRequests: number;
    logLevel: string;
  };
  docker: {
    postgres: {
      user: string;
      password: string;
      database: string;
    };
  };
}

const ROOT = resolve(__dirname, '..');
const CONFIG_PATH = resolve(ROOT, 'config', 'local.json');
const ENV_PATH = resolve(ROOT, '.env');
const ENV_TEST_PATH = resolve(ROOT, '.env.test');
const ENV_EXAMPLE_PATH = resolve(ROOT, '.env.example');
const DOCKER_ENV_PATH = resolve(ROOT, 'docker', '.env');

function loadConfig(): LocalConfig {
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) as LocalConfig;
}

function buildDatabaseUrl(db: LocalConfig['database']): string {
  const encodedPassword = encodeURIComponent(db.password);
  return `postgresql://${db.user}:${encodedPassword}@${db.host}:${db.port}/${db.name}?schema=${db.schema}`;
}

function buildRedisUrl(redis: LocalConfig['redis']): string {
  return `redis://${redis.host}:${redis.port}`;
}

function generateSecret(): string {
  return randomBytes(48).toString('base64url');
}

function readExistingEnv(filePath: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!existsSync(filePath)) return map;

  for (const line of readFileSync(filePath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    map.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
  }
  return map;
}

function isPlaceholderSecret(value: string | undefined): boolean {
  if (!value) return true;
  return value.startsWith('change-me-') || value.startsWith('test-');
}

function buildEnvContent(
  config: LocalConfig,
  options: {
    nodeEnv: string;
    port: number;
    bcryptRounds: number;
    rateLimitMaxRequests: number;
    logLevel: string;
    preserveSecrets?: Map<string, string>;
  },
): string {
  const existing = options.preserveSecrets ?? new Map<string, string>();

  const accessSecret = isPlaceholderSecret(existing.get('JWT_ACCESS_SECRET'))
    ? generateSecret()
    : existing.get('JWT_ACCESS_SECRET')!;

  const refreshSecret = isPlaceholderSecret(existing.get('JWT_REFRESH_SECRET'))
    ? generateSecret()
    : existing.get('JWT_REFRESH_SECRET')!;

  const lines = [
    `# Auto-generated from config/local.json — run: npm run env:sync`,
    `NODE_ENV=${options.nodeEnv}`,
    `PORT=${options.port}`,
    `API_PREFIX=${config.app.apiPrefix}`,
    ``,
    `# Database`,
    `DATABASE_URL=${buildDatabaseUrl(config.database)}`,
    ``,
    `# Redis`,
    `REDIS_URL=${buildRedisUrl(config.redis)}`,
    ``,
    `# JWT`,
    `JWT_ACCESS_SECRET=${accessSecret}`,
    `JWT_REFRESH_SECRET=${refreshSecret}`,
    `JWT_ACCESS_EXPIRES_IN=${config.jwt.accessExpiresIn}`,
    `JWT_REFRESH_EXPIRES_IN=${config.jwt.refreshExpiresIn}`,
    ``,
    `# Security`,
    `BCRYPT_ROUNDS=${options.bcryptRounds}`,
    `RATE_LIMIT_WINDOW_MS=${config.security.rateLimitWindowMs}`,
    `RATE_LIMIT_MAX_REQUESTS=${options.rateLimitMaxRequests}`,
    ``,
    `# Logging`,
    `LOG_LEVEL=${options.logLevel}`,
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

function buildEnvExample(config: LocalConfig): string {
  return buildEnvContent(config, {
    nodeEnv: config.app.nodeEnv,
    port: config.app.port,
    bcryptRounds: config.security.bcryptRounds,
    rateLimitMaxRequests: config.security.rateLimitMaxRequests,
    logLevel: config.logging.level,
    preserveSecrets: new Map([
      ['JWT_ACCESS_SECRET', 'change-me-access-secret-min-32-chars!!'],
      ['JWT_REFRESH_SECRET', 'change-me-refresh-secret-min-32-chars!'],
    ]),
  });
}

function buildDockerEnv(config: LocalConfig): string {
  const db = config.docker.postgres;
  return [
    `# Auto-generated from config/local.json — run: npm run env:sync`,
    `PORT=${config.app.port}`,
    `POSTGRES_USER=${db.user}`,
    `POSTGRES_PASSWORD=${db.password}`,
    `POSTGRES_DB=${db.database}`,
    `JWT_ACCESS_SECRET=change-me-access-secret-min-32-chars!!`,
    `JWT_REFRESH_SECRET=change-me-refresh-secret-min-32-chars!`,
    `JWT_ACCESS_EXPIRES_IN=${config.jwt.accessExpiresIn}`,
    `JWT_REFRESH_EXPIRES_IN=${config.jwt.refreshExpiresIn}`,
    `BCRYPT_ROUNDS=${config.security.bcryptRounds}`,
    `RATE_LIMIT_WINDOW_MS=${config.security.rateLimitWindowMs}`,
    `RATE_LIMIT_MAX_REQUESTS=${config.security.rateLimitMaxRequests}`,
    `LOG_LEVEL=${config.logging.level}`,
    '',
  ].join('\n');
}

function writeFile(relativePath: string, content: string): void {
  writeFileSync(resolve(ROOT, relativePath), content, 'utf-8');
  console.log(`  ✓ ${relativePath}`);
}

function main(): void {
  console.log('Syncing local config files from config/local.json...\n');

  const config = loadConfig();
  const existingEnv = readExistingEnv(ENV_PATH);

  writeFile(
    '.env',
    buildEnvContent(config, {
      nodeEnv: config.app.nodeEnv,
      port: config.app.port,
      bcryptRounds: config.security.bcryptRounds,
      rateLimitMaxRequests: config.security.rateLimitMaxRequests,
      logLevel: config.logging.level,
      preserveSecrets: existingEnv,
    }),
  );

  writeFile(
    '.env.test',
    buildEnvContent(config, {
      nodeEnv: 'test',
      port: config.test.port,
      bcryptRounds: config.test.bcryptRounds,
      rateLimitMaxRequests: config.test.rateLimitMaxRequests,
      logLevel: config.test.logLevel,
      preserveSecrets: readExistingEnv(ENV_TEST_PATH),
    }),
  );

  writeFile('.env.example', buildEnvExample(config));
  writeFile('docker/.env', buildDockerEnv(config));

  console.log('\nLocal files synced successfully.');
}

main();
