import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

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
  isLoading: boolean;
  progress: number;
  duration: number;
  playPodcast: (podcast: Podcast, durationInSeconds: number) => void;
  pausePodcast: () => void;
  resumePodcast: () => void;
  stopPodcast: () => void;
  clearPodcast: () => void;
  seekTo: (value: number) => void;
  formatTime: (seconds: number) => string;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};

// Sample podcast audio URLs (public domain)
const PODCAST_AUDIO_URLS: Record<string, string> = {
  default: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentPodcastRef = useRef<Podcast | null>(null);

  useEffect(() => { currentPodcastRef.current = currentPodcast; }, [currentPodcast]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const unloadCurrent = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  };

  const clearPodcast = () => {
    unloadCurrent();
    setCurrentPodcast(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
  };

  const playPodcast = (podcast: Podcast, durationInSeconds: number) => {
    setIsLoading(true);
    setIsPlaying(false);

    // If same podcast is already loaded, just toggle
    if (currentPodcastRef.current?.id === podcast.id && audioRef.current) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      }
      setIsLoading(false);
      return;
    }

    unloadCurrent();
    setCurrentPodcast(podcast);
    currentPodcastRef.current = podcast;
    setProgress(0);

    const uri = PODCAST_AUDIO_URLS[podcast.id] || PODCAST_AUDIO_URLS.default;
    const audio = new Audio(uri);
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setProgress(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
      // Use actual audio duration if available, otherwise use provided duration
      const actualDuration = isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : durationInSeconds;
      setDuration(actualDuration);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
    });

    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    // Set initial duration from parameter while audio loads
    if (durationInSeconds > 0) {
      setDuration(durationInSeconds);
    }

    setIsLoading(false);
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setIsPlaying(false);
    });
  };

  const pausePodcast = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumePodcast = () => {
    if (!audioRef.current) {
      if (currentPodcastRef.current) {
        playPodcast(currentPodcastRef.current, duration);
      }
      return;
    }
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {});
  };

  const stopPodcast = () => {
    unloadCurrent();
    setIsPlaying(false);
    setCurrentPodcast(null);
    currentPodcastRef.current = null;
    setProgress(0);
    setDuration(0);
  };

  const seekTo = (value: number) => {
    if (audioRef.current && value >= 0 && value <= duration) {
      audioRef.current.currentTime = value;
      setProgress(value);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PlayerContext.Provider
      value={{
        currentPodcast,
        isPlaying,
        isLoading,
        progress,
        duration,
        playPodcast,
        pausePodcast,
        resumePodcast,
        stopPodcast,
        clearPodcast,
        seekTo,
        formatTime,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
