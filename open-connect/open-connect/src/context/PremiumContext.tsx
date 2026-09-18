import React, { createContext, useContext, useState } from 'react';

interface PremiumContextType {
  showPremiumModal: boolean;
  openPremiumModal: () => void;
  closePremiumModal: () => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const openPremiumModal = () => setShowPremiumModal(true);
  const closePremiumModal = () => setShowPremiumModal(false);

  return (
    <PremiumContext.Provider value={{ showPremiumModal, openPremiumModal, closePremiumModal }}>
      {children}
    </PremiumContext.Provider>
  );
};
