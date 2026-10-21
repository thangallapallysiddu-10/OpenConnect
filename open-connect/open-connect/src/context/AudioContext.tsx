import { Audio } from 'expo-av';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { registerPlaybackChannel, yieldTo } from './PlaybackCoordinator';

// ── Types ─────────────────────────────────────────────────────────────────────

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
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (seconds: number) => Promise<void>;
  seekForward: () => Promise<void>;
  seekBackward: () => Promise<void>;
}

// ── Sample tracks — defined OUTSIDE component so never recreated ──────────────

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

// ── Context ───────────────────────────────────────────────────────────────────

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};

// ── Provider ──────────────────────────────────────────────────────────────────

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [isLoaded, setIsLoaded]         = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [position, setPosition]         = useState(0);
  const [duration, setDuration]         = useState(0);

  // Refs to avoid stale closures in callbacks
  const soundRef        = useRef<Audio.Sound | null>(null);
  const currentTrackRef = useRef<Track | null>(null);
  const durationRef     = useRef<number>(0);
  const positionRef     = useRef<number>(0);

  // Keep refs in sync
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { positionRef.current = position; }, [position]);

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
    };
  }, []);

  // ── Playback coordinator registration ───────────────────────────────────────
  // When a podcast / RJ live session starts playing, we pause any loaded sound
  // so two "now playing" bars never show simultaneously. The track stays loaded
  // so the user can hit play on the mini-player to resume.
  useEffect(() => {
    return registerPlaybackChannel('song', () => {
      const sound = soundRef.current;
      // Flip the UI flag synchronously so no frame shows two "playing" bars.
      setIsPlaying(false);
      if (!sound) return;
      sound.getStatusAsync()
        .then(status => {
          if (status.isLoaded && status.isPlaying) {
            return sound.pauseAsync();
          }
          return undefined;
        })
        .catch(() => {});
    });
  }, []);

  // ── Unload helper ───────────────────────────────────────────────────────────
  const unloadCurrent = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (_) {}
      soundRef.current = null;
    }
  };

  // ── Core play ───────────────────────────────────────────────────────────────
  const playTrackInternal = async (track: Track) => {
    try {
      // Any podcast / RJ live session currently playing must yield the floor
      // so we never have two "now playing" bars at once.
      yieldTo('song');
      setIsLoading(true);
      setIsLoaded(false);
      setPosition(0);
      setDuration(0);

      await unloadCurrent();

      setCurrentTrack(track);
      currentTrackRef.current = track;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const uri = track.uri ?? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 },
        (status) => {
          // Inline callback uses refs — no stale closure issues
          if (!status.isLoaded) return;
          setIsPlaying(status.isPlaying);
          setPosition(status.positionMillis / 1000);
          if (status.durationMillis) {
            setDuration(status.durationMillis / 1000);
            durationRef.current = status.durationMillis / 1000;
          }
          if (status.didJustFinish) {
            const t = currentTrackRef.current;
            if (!t) return;
            const idx  = SAMPLE_TRACKS.findIndex(x => x.id === t.id);
            const next = SAMPLE_TRACKS[(idx + 1) % SAMPLE_TRACKS.length];
            setTimeout(() => playTrackInternal(next), 400);
          }
        }
      );

      soundRef.current = sound;

      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        setDuration(status.durationMillis / 1000);
        durationRef.current = status.durationMillis / 1000;
      }

      setIsLoaded(true);
      setIsPlaying(true);
    } catch (error) {
      console.error('playTrackInternal error:', error);
      Alert.alert('Playback Error', 'Could not play this track.');
      setIsLoaded(false);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Public playTrack ────────────────────────────────────────────────────────
  const playTrack = async (track: Track) => {
    if (currentTrackRef.current?.id === track.id && soundRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) return;
        if (status.isLoaded && !status.isPlaying) {
          yieldTo('song');
          await soundRef.current.playAsync();
          setIsPlaying(true);
          return;
        }
      } catch (_) {}
    }
    await playTrackInternal(track);
  };

  // ── Pause ───────────────────────────────────────────────────────────────────
  const pauseTrack = async () => {
    if (!soundRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('pauseTrack error:', error);
    }
  };

  // ── Resume ──────────────────────────────────────────────────────────────────
  const resumeTrack = async () => {
    if (!soundRef.current) {
      if (currentTrackRef.current) await playTrackInternal(currentTrackRef.current);
      return;
    }
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        yieldTo('song');
        await soundRef.current.playAsync();
        setIsPlaying(true);
      } else if (!status.isLoaded && currentTrackRef.current) {
        await playTrackInternal(currentTrackRef.current);
      }
    } catch (error) {
      console.error('resumeTrack error:', error);
      if (currentTrackRef.current) await playTrackInternal(currentTrackRef.current);
    }
  };

  // ── Seek ────────────────────────────────────────────────────────────────────
  const seekTo = async (seconds: number) => {
    if (!soundRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        const clamped = Math.max(0, Math.min(seconds, durationRef.current));
        await soundRef.current.setPositionAsync(clamped * 1000);
        setPosition(clamped);
      }
    } catch (error) {
      console.error('seekTo error:', error);
    }
  };

  const seekForward  = async () => seekTo(positionRef.current + 10);
  const seekBackward = async () => seekTo(positionRef.current - 10);

  // ── Next / Previous ─────────────────────────────────────────────────────────
  const playNext = useCallback(() => {
    const track = currentTrackRef.current;
    if (!track) return;
    const idx  = SAMPLE_TRACKS.findIndex(t => t.id === track.id);
    const next = SAMPLE_TRACKS[(idx + 1) % SAMPLE_TRACKS.length];
    playTrackInternal(next);
  }, []);

  const playPrevious = useCallback(() => {
    const track = currentTrackRef.current;
    if (!track) return;
    const idx  = SAMPLE_TRACKS.findIndex(t => t.id === track.id);
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