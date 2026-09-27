import crypto from 'node:crypto';
import { env } from '../../config/env';
import { transaction } from '../../database/pool';
import { ConflictError, UnauthorizedError } from '../../shared/http/errors';
import { hashPassword, verifyPassword } from '../../shared/security/password';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../../shared/security/tokens';
import { AuthRepository, UserRow } from './auth.repository';
import { LoginInput, RegisterInput } from './auth.schemas';

export const safeUser = (u: UserRow) => ({ id:u.id, email:u.email, displayName:u.display_name, avatarUrl:u.avatar_url, bio:u.bio, location:u.location, role:u.role, status:u.status, createdAt:u.created_at });

async function issue(user: UserRow, deviceId: string | null, familyId = crypto.randomUUID()) {
  const refreshToken = signRefreshToken(user.id, familyId);
  await transaction(client => AuthRepository.storeToken(client, user.id, familyId, hashToken(refreshToken), deviceId, new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400000)));
  return { accessToken: signAccessToken({ sub:user.id, email:user.email, role:user.role }), refreshToken, expiresIn:env.ACCESS_TOKEN_TTL_SECONDS };
}

export async function register(input: RegisterInput) {
  if (await AuthRepository.byEmail(input.email)) throw new ConflictError('Email already registered');
  const user = await AuthRepository.create(input.email, await hashPassword(input.password), input.displayName);
  const device = await AuthRepository.storeDevice(user.id, input.deviceKey, input.platform, input.pushToken);
  return { user:safeUser(user), tokens:await issue(user, device.id) };
}

export async function login(input: LoginInput) {
  const user = await AuthRepository.byEmail(input.email);
  if (!user || !await verifyPassword(input.password, user.password_hash) || user.status !== 'active') throw new UnauthorizedError('Invalid email or password');
  const device = await AuthRepository.storeDevice(user.id, input.deviceKey, input.platform, input.pushToken);
  return { user:safeUser(user), tokens:await issue(user, device.id) };
}

export async function refresh(token: string) {
  let payload: ReturnType<typeof verifyRefreshToken>;

  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const result: any = await transaction(async client => {
    const found = await client.query<any>(
      `
      SELECT
        rt.id token_id,
        rt.user_id,
        rt.family_id,
        rt.revoked_at,
        rt.expires_at,
        u.id,
        u.email,
        u.password_hash,
        u.display_name,
        u.avatar_url,
        u.bio,
        u.location,
        u.role,
        u.status,
        u.created_at
      FROM refresh_tokens rt
      JOIN users u ON u.id = rt.user_id
      WHERE rt.token_hash = $1
      FOR UPDATE
      `,
      [hashToken(token)]
    );

    const row = found.rows[0];

    if (!row) {
      return { invalid: true };
    }

    if (
      row.revoked_at ||
      new Date(row.expires_at) <= new Date() ||
      row.user_id !== payload.sub
    ) {
      await client.query(
        `
        UPDATE refresh_tokens
        SET revoked_at = COALESCE(revoked_at, now())
        WHERE family_id = $1
        `,
        [row.family_id]
      );

      return { invalid: true };
    }

    const device = await client.query<{ id: string }>(
      `
      SELECT id
      FROM devices
      WHERE user_id = $1
      LIMIT 1
      `,
      [row.user_id]
    );

    if (!device.rows.length) {
      throw new UnauthorizedError('Device not found');
    }

    const next = signRefreshToken(row.user_id, row.family_id);

    const stored = await AuthRepository.storeToken(
      client,
      row.user_id,
      row.family_id,
      hashToken(next),
      device.rows[0].id,
      new Date(
        Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400000
      )
    );

    await client.query(
      `
      UPDATE refresh_tokens
      SET revoked_at = now(),
          replaced_by = $2
      WHERE id = $1
      `,
      [row.token_id, stored.id]
    );

    const user: UserRow = row;

    return {
      user: safeUser(user),
      tokens: {
        accessToken: signAccessToken({
          sub: user.id,
          email: user.email,
          role: user.role
        }),
        refreshToken: next,
        expiresIn: env.ACCESS_TOKEN_TTL_SECONDS
      }
    };
  });

  if (result.invalid) {
    throw new UnauthorizedError('Invalid or reused refresh token');
  }

  return result;
}

export async function logout(token: string) {
  await transaction(async client => { await client.query('UPDATE refresh_tokens SET revoked_at=now() WHERE token_hash=$1 AND revoked_at IS NULL', [hashToken(token)]); });
  return { loggedOut:true };
}
