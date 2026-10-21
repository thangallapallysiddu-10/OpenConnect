import React, { createContext, ReactNode, useContext, useState } from 'react';

interface Country {
  id: string;
  name: string;
  code: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface PodcastContextType {
  selectedCountry: Country | null;
  selectedCategory: Category | null;
  setSelectedCountry: (country: Country | null) => void;
  setSelectedCategory: (category: Category | null) => void;
  podcasts: any[];
  setPodcasts: (podcasts: any[]) => void;
}

const PodcastContext = createContext<PodcastContextType | undefined>(undefined);

export const usePodcastContext = () => {
  const context = useContext(PodcastContext);
  if (!context) {
    throw new Error('usePodcastContext must be used within a PodcastProvider');
  }
  return context;
};

export const PodcastProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [podcasts, setPodcasts] = useState<any[]>([]);

  return (
    <PodcastContext.Provider
      value={{
        selectedCountry,
        selectedCategory,
        setSelectedCountry,
        setSelectedCategory,
        podcasts,
        setPodcasts,
      }}
    >
      {children}
    </PodcastContext.Provider>
  );
};