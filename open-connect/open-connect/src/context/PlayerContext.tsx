import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface Podcast {
  id: string;
  title: string;
  creator: string;
  image: string;
  duration?: string;
}

interface PlayerContextType {
  currentPodcast: Podcast | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  playPodcast: (podcast: Podcast, durationInSeconds: number) => void; // Fixed: duration is required number
  pausePodcast: () => void;
  resumePodcast: () => void;
  stopPodcast: () => void;
  seekTo: (value: number) => void;
  formatTime: (seconds: number) => string;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const startProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= duration) {
          // Auto-stop when reaches end
          setIsPlaying(false);
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
          }
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const playPodcast = (podcast: Podcast, durationInSeconds: number) => {
    // If it's a different podcast, reset progress
    if (currentPodcast?.id !== podcast.id) {
      setCurrentPodcast(podcast);
      setProgress(0);
      setDuration(durationInSeconds);
    }
    
    setIsPlaying(true);
    startProgressTracking();
  };

  const pausePodcast = () => {
    setIsPlaying(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const resumePodcast = () => {
    if (currentPodcast) {
      setIsPlaying(true);
      startProgressTracking();
    }
  };

  const stopPodcast = () => {
    setIsPlaying(false);
    setCurrentPodcast(null);
    setProgress(0);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const seekTo = (value: number) => {
    setProgress(value);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PlayerContext.Provider
      value={{
        currentPodcast,
        isPlaying,
        progress,
        duration,
        playPodcast,
        pausePodcast,
        resumePodcast,
        stopPodcast,
        seekTo,
        formatTime,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};