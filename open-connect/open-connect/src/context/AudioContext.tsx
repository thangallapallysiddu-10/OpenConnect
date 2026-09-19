import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  image: any;
  uri?: string;
}

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  playTrack: (track: Track) => Promise<void>;
  pauseTrack: () => Promise<void>;
  resumeTrack: () => Promise<void>;
  clearTrack: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (seconds: number) => Promise<void>;
  seekForward: () => Promise<void>;
  seekBackward: () => Promise<void>;
}

const SAMPLE_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Kalank',
    artist: 'Arijit Singh',
    image: { uri: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400&h=400&fit=crop' },
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh',
    image: { uri: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: '3',
    title: 'Raabta',
    artist: 'Arijit Singh',
    image: { uri: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: '4',
    title: 'Samjhawan',
    artist: 'Arijit Singh',
    image: { uri: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: '5',
    title: 'Dooron Dooron',
    artist: 'Arijit Singh',
    image: { uri: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop' },
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: '6',
    title: 'Varoon',
    artist: 'Arijit Singh',
    image: { uri: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=400&fit=crop' },
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
];

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // HTMLAudioElement ref (replaces expo-av Audio.Sound)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<Track | null>(null);
  const positionRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

  // Keep refs in sync
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { positionRef.current = position; }, [position]);

  // Cleanup on unmount
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
      audioRef.current.removeEventListener('timeupdate', () => {});
      audioRef.current.removeEventListener('loadedmetadata', () => {});
      audioRef.current.removeEventListener('ended', () => {});
      audioRef.current.src = '';
      audioRef.current = null;
    }
  };

  const clearTrack = () => {
    console.log('🧹 Clearing song track');
    unloadCurrent();
    setCurrentTrack(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
    setIsLoaded(false);
  };

  const playTrackInternal = async (track: Track) => {
    try {
      setIsLoading(true);
      setIsLoaded(false);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);

      unloadCurrent();

      setCurrentTrack(track);
      currentTrackRef.current = track;

      const uri = track.uri;
      if (!uri) {
        console.error('❌ No URI provided for track:', track.title);
        setIsLoading(false);
        return;
      }

      // Create native browser audio element
      const audio = new Audio(uri);
      audioRef.current = audio;

      // Progress updates
      audio.addEventListener('timeupdate', () => {
        setPosition(audio.currentTime);
        positionRef.current = audio.currentTime;
      });

      // Duration once metadata loads
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
        durationRef.current = audio.duration;
      });

      // Auto-advance to next track when done
      audio.addEventListener('ended', () => {
        const t = currentTrackRef.current;
        if (!t) return;
        const idx = SAMPLE_TRACKS.findIndex(x => x.id === t.id);
        const next = SAMPLE_TRACKS[(idx + 1) % SAMPLE_TRACKS.length];
        setTimeout(() => playTrackInternal(next), 400);
      });

      // Sync playing state with browser audio events
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));

      setIsLoaded(true);
      setIsLoading(false);

      // ── FIX: Actually start playing ──
      try {
        await audio.play();
        setIsPlaying(true);
        console.log('▶️ Playing:', track.title);
      } catch (playError) {
        console.warn('⚠️ Autoplay blocked, user interaction required:', playError);
        setIsPlaying(false);
      }

    } catch (error) {
      console.error('playTrackInternal error:', error);
      setIsLoaded(false);
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const playTrack = async (track: Track) => {
    console.log('🎵 playTrack called for:', track.title);

    // Same track already loaded → toggle play/pause
    if (currentTrackRef.current?.id === track.id && audioRef.current) {
      const audio = audioRef.current;
      if (!audio.paused) {
        console.log('⏸️ Pausing');
        audio.pause();
        setIsPlaying(false);
      } else {
        console.log('▶️ Resuming');
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (e) {
          console.warn('Resume failed:', e);
        }
      }
      return;
    }

    console.log('🆕 Loading new track');
    await playTrackInternal(track);
  };

  const pauseTrack = async () => {
    console.log('⏸️ pauseTrack called');
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeTrack = async () => {
    console.log('▶️ resumeTrack called');
    if (!audioRef.current) {
      if (currentTrackRef.current) await playTrackInternal(currentTrackRef.current);
      return;
    }
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('resumeTrack error:', error);
      if (currentTrackRef.current) await playTrackInternal(currentTrackRef.current);
    }
  };

  const seekTo = async (seconds: number) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(seconds, durationRef.current));
    audioRef.current.currentTime = clamped;
    setPosition(clamped);
  };

  const seekForward = async () => seekTo(positionRef.current + 10);
  const seekBackward = async () => seekTo(positionRef.current - 10);

  const playNext = useCallback(() => {
    const track = currentTrackRef.current;
    if (!track) return;
    const idx = SAMPLE_TRACKS.findIndex(t => t.id === track.id);
    const next = SAMPLE_TRACKS[(idx + 1) % SAMPLE_TRACKS.length];
    playTrackInternal(next);
  }, []);

  const playPrevious = useCallback(() => {
    const track = currentTrackRef.current;
    if (!track) return;
    const idx = SAMPLE_TRACKS.findIndex(t => t.id === track.id);
    const prev = SAMPLE_TRACKS[(idx - 1 + SAMPLE_TRACKS.length) % SAMPLE_TRACKS.length];
    playTrackInternal(prev);
  }, []);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoaded,
        isLoading,
        position,
        duration,
        playTrack,
        pauseTrack,
        resumeTrack,
        clearTrack,
        playNext,
        playPrevious,
        seekTo,
        seekForward,
        seekBackward,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};