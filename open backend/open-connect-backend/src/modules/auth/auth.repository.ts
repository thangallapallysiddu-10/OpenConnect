import { PoolClient } from 'pg';
import { query } from '../../database/pool';

export type UserRow = { id:string; email:string; password_hash:string; display_name:string; avatar_url:string|null; bio:string|null; location:string|null; role:'user'|'admin'; status:string; created_at:Date };

let deviceTable: 'user_devices' | 'devices' | null = null;

async function tableExists(tableName: string) {
  const result = await query<{ exists: boolean }>(
    "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1)",
    [tableName],
  );
  return result.rows[0]?.exists ?? false;
}

async function resolveDeviceTable() {
  if (deviceTable) return deviceTable;
  deviceTable = await tableExists('user_devices') ? 'user_devices' : 'devices';
  return deviceTable;
}

const safeFields = "id,email,display_name,avatar_url,bio,location,role,lower(status::text) status,created_at";
const userFields = `id,email,password_hash,display_name,avatar_url,bio,location,role,lower(status::text) status,created_at`;

const toDeviceType = (platform?: string) => {
  if (platform === 'web') return 'WEB';
  if (platform === 'ios' || platform === 'android') return 'MOBILE';
  return 'OTHER';
};

export const AuthRepository = {
  byEmail: async (email:string) => (await query<UserRow>(`SELECT ${userFields} FROM users WHERE lower(email)=lower($1)`,[email])).rows[0],
  byId: async (id:string) => (await query<UserRow>(`SELECT ${safeFields} FROM users WHERE id=$1`,[id])).rows[0],
  create: async (email:string,passwordHash:string,displayName:string) => (await query<UserRow>(`INSERT INTO users(email,password_hash,display_name) VALUES($1,$2,$3) RETURNING ${safeFields}`,[email,passwordHash,displayName])).rows[0],
  storeDevice: async (userId:string,key:string,platform?:string,pushToken?:string) => {
    if (await resolveDeviceTable() === 'user_devices') {
      return (await query<{id:string}>(`INSERT INTO user_devices(user_id,device_key,platform,push_token) VALUES($1,$2,$3,$4) ON CONFLICT(user_id,device_key) DO UPDATE SET platform=EXCLUDED.platform,push_token=COALESCE(EXCLUDED.push_token,user_devices.push_token),last_seen_at=now() RETURNING id`,[userId,key,platform??null,pushToken??null])).rows[0];
    }

    return (await query<{id:string}>(`INSERT INTO devices(user_id,device_id,device_type,last_login,updated_at) VALUES($1,$2,$3,now(),now()) ON CONFLICT(user_id,device_id) DO UPDATE SET device_type=EXCLUDED.device_type,last_login=now(),updated_at=now() RETURNING id`,[userId,key,toDeviceType(platform)])).rows[0];
  },
  storeToken: async (client:PoolClient,userId:string,familyId:string,hash:string,deviceId:string|null,expiresAt:Date) => (await client.query<{id:string}>('INSERT INTO refresh_tokens(user_id,family_id,token_hash,device_id,expires_at) VALUES($1,$2,$3,$4,$5) RETURNING id',[userId,familyId,hash,deviceId,expiresAt])).rows[0],

  /**
   * Find an existing user by email (for Google OAuth) or create one without a
   * password. The password_hash is set to an unusable sentinel so the account
   * can never be used for email/password login.
   */
  findOrCreateOAuthUser: async (
    email: string,
    displayName: string,
    avatarUrl: string | null,
  ): Promise<UserRow> => {
    // Try to find the existing account first.
    const existing = await query<UserRow>(
      `SELECT ${userFields} FROM users WHERE lower(email) = lower($1)`,
      [email],
    );
    if (existing.rows[0]) return existing.rows[0];

    // Create a new account — password_hash sentinel makes email/password login impossible.
    const created = await query<UserRow>(
      `INSERT INTO users (email, password_hash, display_name, avatar_url)
       VALUES ($1, $2, $3, $4)
       RETURNING ${safeFields}`,
      [email.toLowerCase(), 'oauth:google:no-password', displayName, avatarUrl],
    );
    return created.rows[0];
  },
};
