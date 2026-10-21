import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { ZodError } from 'zod';
import { env } from './config/env';
import { checkRedisHealth, connectRedis, disconnectRedis } from './config/redis';
import { pool } from './database/pool';
import { ensureDatabaseCompatibility } from './database/compatibility';
import { registerSwagger } from './plugins/swagger';
import { createLiveGateway } from './plugins/websocket';
import { AppError } from './shared/http/errors';
import { authRoutes } from './modules/auth/auth.routes'; import { userRoutes } from './modules/users/users.routes';
import { songsRoutes } from './modules/songs/songs.routes'; import { podcastsRoutes } from './modules/podcasts/podcasts.routes';
import { stationsRoutes } from './modules/stations/stations.routes'; import { rjsRoutes } from './modules/rjs/rjs.routes'; import { eventsRoutes } from './modules/events/events.routes';
import { favoritesRoutes } from './modules/favorites/favorites.routes'; import { playbackRoutes } from './modules/playback/playback.routes';
import { notificationsRoutes } from './modules/notifications/notifications.routes'; import { reportsRoutes } from './modules/reports/reports.routes';
import { searchRoutes } from './modules/search/search.routes'; import { homeRoutes } from './modules/home/home.routes';
import { registerCatalogRoutes } from './shared/routes/catalog.routes'; import { closeQueues } from './queues';
import { closeWorkers, startWorkers } from './queues/workers';

export async function buildApp() {
  const app = Fastify({
    logger: true,
    trustProxy: true,
  });
  await app.register(cors, { origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','), credentials: true });
  await app.register(helmet); await app.register(rateLimit, { max: 300, timeWindow: '1 minute' });
  await registerSwagger(app); await connectRedis(); startWorkers(); await ensureDatabaseCompatibility();
  app.get('/health', async (_request, reply) => {
    const redisHealthy = await checkRedisHealth();
    try {
      await pool.query('SELECT 1');
      return {
        status: redisHealthy ? 'healthy' : 'degraded',
        database: true,
        redis: redisHealthy,
      };
    } catch {
      return reply.code(503).send({
        status: 'unhealthy',
        database: false,
        redis: redisHealthy,
      });
    }
  });
  const v = env.API_PREFIX;
  await app.register(authRoutes, { prefix: `${v}/auth` }); await app.register(userRoutes, { prefix: `${v}/users` });
  await app.register(homeRoutes, { prefix: `${v}/home` }); await app.register(songsRoutes, { prefix: `${v}/songs` });
  await app.register(podcastsRoutes, { prefix: `${v}/podcasts` }); await app.register(stationsRoutes, { prefix: `${v}/stations` });
  await app.register(rjsRoutes, { prefix: `${v}/rjs` }); await app.register(eventsRoutes, { prefix: `${v}/events` });
  await app.register(async child => registerCatalogRoutes(child, 'channels', false), { prefix: `${v}/channels` });
  await app.register(async child => registerCatalogRoutes(child, 'ads', false), { prefix: `${v}/ads` });
  await app.register(favoritesRoutes, { prefix: `${v}/favorites` }); await app.register(playbackRoutes, { prefix: v });
  await app.register(notificationsRoutes, { prefix: `${v}/notifications` }); await app.register(reportsRoutes, { prefix: v });
  await app.register(searchRoutes, { prefix: `${v}/search` }); createLiveGateway(app);
  app.setNotFoundHandler((_request, reply) => reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } }));
  app.setErrorHandler((error, request, reply) => {
    request.log.error({ error }, error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof AppError) return reply.code(error.statusCode).send({ success: false, error: { code: error.code, message: error.message, details: error.details } });
    if (error instanceof ZodError) return reply.code(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: error.flatten() } });
    return reply.code(500).send({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error' } });
  });
  app.addHook('onClose', async () => { await Promise.allSettled([closeWorkers(), closeQueues(), pool.end(), disconnectRedis()]); });
  return app;
}
