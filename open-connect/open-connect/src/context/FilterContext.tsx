import React, { createContext, useContext, useState } from 'react';

interface FilterContextType {
  globalLanguage: string;
  setGlobalLanguage: (lang: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [globalLanguage, setGlobalLanguage] = useState<string>('');

  return (
    <FilterContext.Provider value={{ globalLanguage, setGlobalLanguage }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
