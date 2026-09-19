import React, { createContext, useContext, useEffect, useState } from 'react';

export type FavoriteType = 'song' | 'podcast' | 'rj' | 'station';

export interface FavoriteItem {
  id: string;
  title: string;
  subtitle: string;
  image: any;
  type: FavoriteType;
  rawData: any;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
  return context;
};

const STORAGE_KEY = '@open_connect_favorites';

function loadFavoritesFromStorage(): FavoriteItem[] {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as FavoriteItem[];
  } catch {}
  return [];
}

function saveFavoritesToStorage(items: FavoriteItem[]): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => loadFavoritesFromStorage());

  useEffect(() => {
    saveFavoritesToStorage(favorites);
  }, [favorites]);

  const addFavorite = (item: FavoriteItem) => {
    setFavorites(prev => {
      if (prev.some(f => f.id === item.id)) return prev;
      return [item, ...prev];
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const toggleFavorite = (item: FavoriteItem) => {
    if (favorites.some(f => f.id === item.id)) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  };

  const isFavorite = (id: string) => favorites.some(f => f.id === id);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
