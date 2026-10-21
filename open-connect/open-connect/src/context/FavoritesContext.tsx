import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export type FavoriteType = 'song' | 'podcast' | 'rj' | 'station';

export interface FavoriteItem {
  id: string;
  title: string;
  subtitle: string;
  image: any;
  type: FavoriteType;
  rawData: any; // Store the original object so it can be passed to the player directly
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

const FAVORITES_STORAGE_KEY = '@melody_meet_favorites';
const documentDirectory = (FileSystem as typeof FileSystem & { documentDirectory?: string }).documentDirectory;
const FAVORITES_STORAGE_FILE = `${documentDirectory ?? ''}melody-meet-favorites.json`;

async function loadFavorites(): Promise<FavoriteItem[] | null> {
  try {
    if (Platform.OS === 'web') {
      const stored = globalThis.localStorage?.getItem(FAVORITES_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as FavoriteItem[]) : [];
    }
    const content = await FileSystem.readAsStringAsync(FAVORITES_STORAGE_FILE);
    return JSON.parse(content) as FavoriteItem[];
  } catch {
    return null; // unreadable store - keep in-memory state instead of wiping it
  }
}

async function persistFavorites(favorites: FavoriteItem[]): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (favorites.length) globalThis.localStorage?.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      else globalThis.localStorage?.removeItem(FAVORITES_STORAGE_KEY);
      return;
    }
    if (favorites.length) await FileSystem.writeAsStringAsync(FAVORITES_STORAGE_FILE, JSON.stringify(favorites));
    else await FileSystem.deleteAsync(FAVORITES_STORAGE_FILE, { idempotent: true });
  } catch {
    // storage unavailable - favorites stay in memory for this session
  }
}

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const hydrated = useRef(false);

  // Hydrate once on mount so favorites survive reloads / app restarts
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadFavorites();
      if (!cancelled && stored) {
        setFavorites(stored);
        hydrated.current = true;
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist on every change, but only after hydration to avoid overwriting the store
  useEffect(() => {
    if (hydrated.current) void persistFavorites(favorites);
  }, [favorites]);

  const addFavorite = useCallback((item: FavoriteItem) => {
    setFavorites(prev => {
      if (prev.some(f => f.id === item.id)) return prev;
      return [item, ...prev]; // Add to front
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites(prev => {
      if (prev.some(f => f.id === item.id)) return prev.filter(f => f.id !== item.id);
      return [item, ...prev];
    });
  }, []);

  const isFavorite = useCallback((id: string) => {
    return favorites.some(f => f.id === id);
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};
