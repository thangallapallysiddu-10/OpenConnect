import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { apiGet, apiPost } from './api';

export type AuthUser = {
  id: string;
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  role?: string;
  status?: string;
  createdAt?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type AuthSession = {
  user: AuthUser;
  tokens: AuthTokens;
};

export type LoginRequest = {
  email: string;
  password: string;
  deviceKey?: string;
  platform?: string;
};

export type RegisterRequest = {
  displayName: string;
  email: string;
  password: string;
  deviceKey?: string;
  platform?: string;
};

export type RefreshRequest = {
  refreshToken: string;
  deviceKey?: string;
};

const DEVICE_KEY_STORAGE_KEY = 'open-connect-device-key';
const documentDirectory = (FileSystem as typeof FileSystem & { documentDirectory?: string }).documentDirectory;
const DEVICE_KEY_FILE = `${documentDirectory ?? ''}open-connect-device-key.txt`;

async function ensureDeviceKey(): Promise<string> {
  if (Platform.OS === 'web') {
    const stored = globalThis.localStorage?.getItem(DEVICE_KEY_STORAGE_KEY);
    if (stored) {
      return stored;
    }

    const generated = globalThis.crypto?.randomUUID?.() ?? `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    globalThis.localStorage?.setItem(DEVICE_KEY_STORAGE_KEY, generated);
    return generated;
  }

  try {
    const stored = await FileSystem.readAsStringAsync(DEVICE_KEY_FILE);
    if (stored.trim()) {
      return stored.trim();
    }
  } catch {
    // Generate a new key below.
  }

  const generated = globalThis.crypto?.randomUUID?.() ?? `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await FileSystem.writeAsStringAsync(DEVICE_KEY_FILE, generated);
  return generated;
}

export async function getDeviceKey(): Promise<string> {
  return ensureDeviceKey();
}

export async function login(input: LoginRequest): Promise<AuthSession> {
  const deviceKey = input.deviceKey ?? (await ensureDeviceKey());
  return apiPost<AuthSession, LoginRequest>('/auth/login', {
    email: input.email,
    password: input.password,
    deviceKey,
    platform: input.platform,
  });
}

export async function register(input: RegisterRequest): Promise<AuthSession> {
  const deviceKey = input.deviceKey ?? (await ensureDeviceKey());
  return apiPost<AuthSession>('/auth/register', {
    displayName: input.displayName,
    email: input.email,
    password: input.password,
    deviceKey,
    platform: input.platform,
  });
}

export function logout(refreshToken: string): Promise<{ loggedOut: boolean }> {
  return apiPost<{ loggedOut: boolean }, { refreshToken: string }>('/auth/logout', { refreshToken });
}

export async function refresh(input: RefreshRequest): Promise<AuthSession> {
  const deviceKey = input.deviceKey ?? (await ensureDeviceKey());
  return apiPost<AuthSession, RefreshRequest>('/auth/refresh', {
    refreshToken: input.refreshToken,
    deviceKey,
  });
}

export function me(accessToken: string): Promise<AuthUser> {
  return apiGet<AuthUser>('/users/me', { accessToken });
}
