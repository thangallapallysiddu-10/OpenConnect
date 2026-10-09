import crypto from 'node:crypto';
import https from 'node:https';
import { FastifyPluginAsync } from 'fastify';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { transaction } from '../../database/pool';
import { created, ok } from '../../shared/http/response';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { hashToken, signAccessToken, signRefreshToken } from '../../shared/security/tokens';
import { AuthRepository } from './auth.repository';
import { login, logout, refresh, register, safeUser } from './auth.service';
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from './auth.schemas';
import { NotFoundError } from '../../shared/http/errors';

// ── Google OAuth helpers ────────────────────────────────────────────────────

/**
 * Build the Google OAuth 2.0 authorization URL.
 * Redirects the user's browser to Google's consent screen.
 */
function buildGoogleAuthUrl(state: string): string {
  const callbackUrl = `${env.API_PREFIX}/auth/google/callback`;
  const redirectUri = encodeURIComponent(
    `${env.NODE_ENV === 'production'
      ? 'https://openconnect-backend.onrender.com'
      : `http://localhost:${env.PORT}`}${callbackUrl}`,
  );
  const scope = encodeURIComponent('openid email profile');
  return (
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${encodeURIComponent(env.GOOGLE_CLIENT_ID ?? '')}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&state=${encodeURIComponent(state)}` +
    `&access_type=offline` +
    `&prompt=select_account`
  );
}

/** POST to Google's token endpoint and parse the JSON response. */
function fetchGoogleTokens(code: string, redirectUri: string): Promise<{
  access_token: string;
  id_token?: string;
  error?: string;
}> {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID ?? '',
      client_secret: env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }).toString();

    const req = https.request(
      {
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk: Buffer) => { raw += chunk.toString(); });
        res.on('end', () => {
          try { resolve(JSON.parse(raw)); }
          catch { reject(new Error('Failed to parse Google token response')); }
        });
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/** Fetch the Google user info using an access token. */
function fetchGoogleUserInfo(accessToken: string): Promise<{
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
  error?: string;
}> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'www.googleapis.com',
        path: '/oauth2/v3/userinfo',
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk: Buffer) => { raw += chunk.toString(); });
        res.on('end', () => {
          try { resolve(JSON.parse(raw)); }
          catch { reject(new Error('Failed to parse Google user info')); }
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
}

// ── Route plugin ────────────────────────────────────────────────────────────

export const authRoutes: FastifyPluginAsync = async (app) => {
  // Existing email/password routes
  app.post('/register', { preHandler: validate(registerSchema), schema: { tags: ['Auth'] } }, async (r, p) =>
    p.code(201).send(created(await register(r.body as never))));

  app.post('/login', { preHandler: validate(loginSchema), schema: { tags: ['Auth'] } }, async (r) =>
    ok(await login(r.body as never)));

  app.post('/refresh', { preHandler: validate(refreshSchema), schema: { tags: ['Auth'] } }, async (r) => {
    const b = r.body as any;
    return ok(await refresh(b.refreshToken));
  });

  app.post('/logout', { preHandler: validate(logoutSchema), schema: { tags: ['Auth'] } }, async (r) =>
    ok(await logout((r.body as any).refreshToken)));

  app.get('/me', { preHandler: authenticate, schema: { tags: ['Auth'], security: [{ bearerAuth: [] }] } }, async (r) => {
    const u = await AuthRepository.byId(r.user!.sub);
    if (!u) throw new NotFoundError('User not found');
    return ok(safeUser(u));
  });

  // ── Google OAuth ──────────────────────────────────────────────────────────

  /**
   * GET /api/v1/auth/google
   * Redirects the browser to Google's OAuth consent screen.
   * If Google credentials are not configured, returns a 503.
   */
  app.get('/google', { schema: { tags: ['Auth'] } }, async (_req, reply) => {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      return reply.code(503).send({
        success: false,
        error: { code: 'OAUTH_NOT_CONFIGURED', message: 'Google OAuth is not configured on this server.' },
      });
    }
    // Use a simple random state value to prevent CSRF on the callback.
    const state = Buffer.from(crypto.randomUUID()).toString('base64url');
    const url = buildGoogleAuthUrl(state);
    return reply.redirect(url);
  });

  /**
   * GET /api/v1/auth/google/callback
   * Google redirects here after the user grants permission.
   * Exchanges the code for tokens, fetches user info, creates/finds the user,
   * issues our own JWT pair, then redirects the browser to the frontend with
   * the tokens in the URL hash so the app can read them without a server.
   */
  app.get('/google/callback', { schema: { tags: ['Auth'] } }, async (req, reply) => {
    const { code, error: oauthError } = req.query as Record<string, string | undefined>;

    const frontendUrl = env.FRONTEND_URL;
    const failureRedirect = `${frontendUrl}/?auth=error&reason=`;

    if (oauthError || !code) {
      const reason = encodeURIComponent(oauthError ?? 'no_code');
      return reply.redirect(`${failureRedirect}${reason}`);
    }

    const redirectUri =
      `${env.NODE_ENV === 'production'
        ? 'https://openconnect-backend.onrender.com'
        : `http://localhost:${env.PORT}`}${env.API_PREFIX}/auth/google/callback`;

    try {
      // 1. Exchange code for access token
      const tokens = await fetchGoogleTokens(code, redirectUri);
      if (tokens.error || !tokens.access_token) {
        logger.warn({ error: tokens.error }, 'Google token exchange failed');
        return reply.redirect(`${failureRedirect}${encodeURIComponent(tokens.error ?? 'token_exchange_failed')}`);
      }

      // 2. Fetch user profile from Google
      const googleUser = await fetchGoogleUserInfo(tokens.access_token);
      if (googleUser.error || !googleUser.email) {
        logger.warn({ error: googleUser.error }, 'Google user info fetch failed');
        return reply.redirect(`${failureRedirect}${encodeURIComponent(googleUser.error ?? 'user_info_failed')}`);
      }

      if (!googleUser.email_verified) {
        return reply.redirect(`${failureRedirect}email_not_verified`);
      }

      // 3. Find or create user in our database
      const user = await AuthRepository.findOrCreateOAuthUser(
        googleUser.email,
        googleUser.name ?? googleUser.email.split('@')[0],
        googleUser.picture ?? null,
      );

      // 4. Store a device entry and issue our own JWT pair
      const device = await AuthRepository.storeDevice(user.id, `google-web-${user.id}`, 'web');

      const familyId = crypto.randomUUID();
      const refreshToken = signRefreshToken(user.id, familyId);
      await transaction((client) =>
        AuthRepository.storeToken(
          client,
          user.id,
          familyId,
          hashToken(refreshToken),
          device.id,
          new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400000),
        ),
      );
      const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });

      // 5. Redirect back to frontend with tokens in the URL fragment.
      //    The fragment is never sent to the server, so tokens stay client-side.
      const params = new URLSearchParams({
        access_token: accessToken,
        refresh_token: refreshToken,
        display_name: user.display_name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url ?? '',
      });
      return reply.redirect(`${frontendUrl}/?auth=google&${params.toString()}`);
    } catch (err) {
      logger.error({ err }, 'Google OAuth callback error');
      return reply.redirect(`${failureRedirect}server_error`);
    }
  });
};