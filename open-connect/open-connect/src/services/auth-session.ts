import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export type StoredAuthSession = {
  accessToken: string;
  refreshToken: string;
};

const STORAGE_KEY = 'open-connect-auth-session';
const documentDirectory = (FileSystem as typeof FileSystem & { documentDirectory?: string }).documentDirectory;
const STORAGE_FILE = `${documentDirectory ?? ''}open-connect-auth-session.json`;

export async function loadAuthSession(): Promise<StoredAuthSession | null> {
  if (Platform.OS === 'web') {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as StoredAuthSession) : null;
  }

  try {
    const content = await FileSystem.readAsStringAsync(STORAGE_FILE);
    return JSON.parse(content) as StoredAuthSession;
  } catch {
    return null;
  }
}

export async function saveAuthSession(session: StoredAuthSession): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(session));
    return;
  }

  await FileSystem.writeAsStringAsync(STORAGE_FILE, JSON.stringify(session));
}

export async function clearAuthSessionStorage(): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
    return;
  }

  await FileSystem.deleteAsync(STORAGE_FILE, { idempotent: true });
}
