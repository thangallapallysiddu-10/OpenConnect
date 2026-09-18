import React, { createContext, useContext, useState } from 'react';

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

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const addFavorite = (item: FavoriteItem) => {
    setFavorites(prev => {
      if (prev.some(f => f.id === item.id)) return prev;
      return [item, ...prev]; // Add to front
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const toggleFavorite = (item: FavoriteItem) => {
    if (isFavorite(item.id)) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  };

  const isFavorite = (id: string) => {
    return favorites.some(f => f.id === id);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
