import React, { createContext, useContext, useState } from 'react';

interface NotificationContextType {
  showNotificationsModal: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const openNotifications = () => setShowNotificationsModal(true);
  const closeNotifications = () => setShowNotificationsModal(false);

  return (
    <NotificationContext.Provider value={{ showNotificationsModal, openNotifications, closeNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
