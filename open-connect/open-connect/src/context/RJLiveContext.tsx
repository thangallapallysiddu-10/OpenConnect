import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { RJSStation } from '../data/rjsLiveStations';
import { registerPlaybackChannel, yieldTo } from './PlaybackCoordinator';

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
  const [currentStation, setCurrentStation] = useState<RJSStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [isLiveRadioFocused, setIsLiveRadioFocused] = useState(false);

  const showMiniPlayer =
    currentStation !== null && sessionActive && !isLiveRadioFocused;

  const setLiveRadioFocused = useCallback((focused: boolean) => {
    setIsLiveRadioFocused(focused);
  }, []);

  const startSession = useCallback((station: RJSStation) => {
    yieldTo('rjLive');
    setCurrentStation(station);
    setSessionActive(true);
    setIsPlaying(true);
  }, []);

  const updateStation = useCallback((station: RJSStation) => {
    setCurrentStation(station);
  }, []);

  const pauseLive = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resumeLive = useCallback(() => {
    if (currentStation) {
      yieldTo('rjLive');
      setIsPlaying(true);
    }
  }, [currentStation]);

  const toggleLive = useCallback(() => {
    setIsPlaying(prev => {
      if (!prev) yieldTo('rjLive');
      return !prev;
    });
  }, []);

  const stopLive = useCallback(() => {
    setCurrentStation(null);
    setIsPlaying(false);
    setSessionActive(false);
  }, []);

  // Register with the playback coordinator so starting a song / podcast
  // automatically pauses this live session (station stays selected so the
  // user can resume from the mini-player).
  useEffect(() => {
    return registerPlaybackChannel('rjLive', () => {
      setIsPlaying(false);
    });
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
