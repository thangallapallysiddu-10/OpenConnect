import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { RJSStation } from '../data/rjsLiveStations';
import { useAudioCoordinator } from './AudioCoordinator';

interface RJLiveContextType {
  currentStation: RJSStation | null;
  isPlaying: boolean;
  isLiveRadioFocused: boolean;
  showMiniPlayer: boolean;
  setLiveRadioFocused: (focused: boolean) => void;
  startSession: (station: RJSStation) => void;
  updateStation: (station: RJSStation) => void;
  pauseLive: () => void;
  resumeLive: () => void;
  toggleLive: () => void;
  stopLive: () => void;
}

const RJLiveContext = createContext<RJLiveContextType | undefined>(undefined);

export const useRJLive = () => {
  const context = useContext(RJLiveContext);
  if (!context) {
    throw new Error('useRJLive must be used within RJLiveProvider');
  }
  return context;
};

export const RJLiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const coordinator = useAudioCoordinator();
  const [currentStation, setCurrentStation] = useState<RJSStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [isLiveRadioFocused, setIsLiveRadioFocused] = useState(false);

  const showMiniPlayer =
    currentStation !== null && sessionActive && !isLiveRadioFocused;

  const setLiveRadioFocused = useCallback((focused: boolean) => {
    setIsLiveRadioFocused(focused);
  }, []);

  // Register stop function with coordinator
  useEffect(() => {
    coordinator.register('rj', () => {
      setCurrentStation(null);
      setIsPlaying(false);
      setSessionActive(false);
    });
  }, [coordinator]);

  const startSession = useCallback((station: RJSStation) => {
    coordinator.stopOthers('rj');
    setCurrentStation(station);
    setSessionActive(true);
    setIsPlaying(true);
  }, [coordinator]);

  const updateStation = useCallback((station: RJSStation) => {
    setCurrentStation(station);
  }, []);

  const pauseLive = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resumeLive = useCallback(() => {
    if (currentStation) {
      setIsPlaying(true);
    }
  }, [currentStation]);

  const toggleLive = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const stopLive = useCallback(() => {
    setCurrentStation(null);
    setIsPlaying(false);
    setSessionActive(false);
  }, []);

  return (
    <RJLiveContext.Provider
      value={{
        currentStation,
        isPlaying,
        isLiveRadioFocused,
        showMiniPlayer,
        setLiveRadioFocused,
        startSession,
        updateStation,
        pauseLive,
        resumeLive,
        toggleLive,
        stopLive,
      }}
    >
      {children}
    </RJLiveContext.Provider>
  );
};
