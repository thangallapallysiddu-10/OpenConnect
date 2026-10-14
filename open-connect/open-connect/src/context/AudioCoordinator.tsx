/**
 * AudioCoordinator — single-source-of-truth for mutual exclusion between
 * the three independent audio contexts (Song, Podcast, RJLive).
 *
 * Each context calls `notifyPlaying(source)` the moment it starts playing.
 * The coordinator fires `stopOthers(source)` which calls the stop/clear
 * functions of all OTHER active sources.
 *
 * This keeps the contexts fully independent while ensuring only one plays
 * at a time, without creating circular dependencies between them.
 */
import React, { createContext, useCallback, useContext, useRef } from 'react';

type AudioSource = 'song' | 'podcast' | 'rj';

type StopFn = () => void;

interface CoordinatorContextType {
  /** Each context registers its own stop function once on mount. */
  register: (source: AudioSource, stopFn: StopFn) => void;
  /** Call this right before starting playback to stop all other sources. */
  stopOthers: (keepSource: AudioSource) => void;
}

const CoordinatorContext = createContext<CoordinatorContextType | undefined>(undefined);

export const useAudioCoordinator = () => {
  const ctx = useContext(CoordinatorContext);
  if (!ctx) throw new Error('useAudioCoordinator must be used within AudioCoordinatorProvider');
  return ctx;
};

export const AudioCoordinatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const registry = useRef<Partial<Record<AudioSource, StopFn>>>({});

  const register = useCallback((source: AudioSource, stopFn: StopFn) => {
    registry.current[source] = stopFn;
  }, []);

  const stopOthers = useCallback((keepSource: AudioSource) => {
    const sources: AudioSource[] = ['song', 'podcast', 'rj'];
    sources.forEach(src => {
      if (src !== keepSource) {
        registry.current[src]?.();
      }
    });
  }, []);

  return (
    <CoordinatorContext.Provider value={{ register, stopOthers }}>
      {children}
    </CoordinatorContext.Provider>
  );
};
