import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function RecordingScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Animation values
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(20)).current;
  const micPulse = useRef(new Animated.Value(1)).current;
  const waveformAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Waveform animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveformAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
      }),
      Animated.timing(waveformAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
        }),
      ])
    ).start();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  // Mic pulse animation when recording
  useEffect(() => {
    if (isRecording && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micPulse, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(micPulse, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      micPulse.setValue(1);
    }
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
  // Navigate back to discover screen
  router.push('/podcasts/discover');// This will go back to discover since recording was pushed on top
};
  const handleStartRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
  };

  const handlePauseRecording = () => {
    setIsPaused(true);
  };

  const handleResumeRecording = () => {
    setIsPaused(false);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    // Navigate to preview or save screen
    router.push('/podcasts/recording-preview');
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    router.push('/podcasts/discover');
  };

  const contentStyle = {
    opacity: contentFade,
    transform: [{ translateY: contentTranslate }],
  };

  // Generate waveform bars
  const waveformBars = [8, 12, 16, 20, 24, 28, 32, 36, 32, 28, 24, 20, 16, 12, 8];

  return (
    <View style={{ flex: 1, backgroundColor: '#1A0505' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0505" />

      {/* Background gradient like player screen */}
      <LinearGradient
        colors={['#2a0000', '#1a0000', '#0f0000', '#000000']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      {/* WHITE TOP SECTION - Like player screen */}
      <View style={styles.topSection}>
        <SafeAreaView>
          <Animated.View style={contentStyle}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="close" size={22} color="#1A0505" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>New Recording</Text>
              <TouchableOpacity style={styles.settingsButton}>
                <Ionicons name="settings-outline" size={22} color="#1A0505" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Main content */}
          <Animated.View style={[styles.contentContainer, contentStyle]}>
            {/* Tutorial badge */}
            <View style={styles.tutorialBadge}>
              <Ionicons name="bookmark-outline" size={14} color="#8B3A3A" />
              <Text style={styles.tutorialText}>How to use Podcastle app to record your first interview. 3 mins • Tutorial</Text>
            </View>

            {/* Timer display */}
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                {isRecording ? formatTime(recordingTime) : '00:00'}
              </Text>
              {isRecording && !isPaused && (
                <View style={styles.recordingDot}>
                  <View style={styles.recordingPulse} />
                </View>
              )}
            </View>

            {/* Waveform visualization */}
            <View style={styles.waveformContainer}>
              {waveformBars.map((height, index) => {
                const animatedHeight = isRecording && !isPaused
                  ? waveformAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [height * 0.6, height * 1.4],
                    })
                  : height;
                
                return (
  <Animated.View
    key={index}
    style={[
      styles.waveformBar,
      {
        height: isRecording && !isPaused
          ? waveformAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [height * 0.6, height * 1.4],
            })
          : height,
        backgroundColor: isRecording && !isPaused
          ? '#CC2222'
          : 'rgba(200,50,50,0.3)',
      },
    ]}
  />
);
              })}
            </View>

            {/* Recording status */}
            <Text style={styles.recordingStatus}>
              {isRecording 
                ? isPaused ? 'Recording paused' : 'Recording in progress...'
                : 'Ready to record'}
            </Text>

            {/* Main instruction */}
            <Text style={styles.mainInstruction}>
              Record your first audio{'\n'}
              <Text style={styles.subInstruction}>Start your interview right away</Text>
            </Text>
          </Animated.View>
        </SafeAreaView>
      </View>

      {/* DARK BOTTOM SECTION - Like player screen */}
      <Animated.View style={[styles.bottomSection, contentStyle]}>
        <View style={styles.handleBarContainer}>
          <View style={styles.handleBar} />
        </View>

        {/* Control buttons */}
        <View style={styles.controlsContainer}>
          {!isRecording ? (
            // Initial state - Start button
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartRecording}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#CC0000', '#8B0000']}
                style={styles.startButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.startButtonText}>Start Recording</Text>
                <Ionicons name="mic" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            // Recording state - Control buttons
            <View style={styles.recordingControls}>
              <TouchableOpacity 
  style={styles.controlButton}
  onPress={() => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    router.replace('/podcasts/recording-preview'); // Use replace instead of push
  }}
>
  <Ionicons name="stop" size={24} color="#FFFFFF" />
  <Text style={styles.controlButtonText}>Stop</Text>
</TouchableOpacity>

              <Animated.View style={{ transform: [{ scale: micPulse }] }}>
                <TouchableOpacity
                  style={styles.mainControlButton}
                  onPress={isPaused ? handleResumeRecording : handlePauseRecording}
                >
                  <LinearGradient
                    colors={['#CC0000', '#8B0000']}
                    style={styles.mainControlGradient}
                  >
                    <Ionicons 
                      name={isPaused ? "mic" : "pause"} 
                      size={32} 
                      color="#FFFFFF" 
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleStopRecording}
              >
                <Ionicons name="stop" size={24} color="#FFFFFF" />
                <Text style={styles.controlButtonText}>Stop</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Upcoming interviews section */}
        {!isRecording && (
          <View style={styles.upcomingSection}>
            <Text style={styles.upcomingTitle}>Upcoming Interviews</Text>
            
            <View style={styles.upcomingItem}>
              <View style={styles.upcomingDot} />
              <View style={styles.upcomingContent}>
                <Text style={styles.upcomingName}>Interview with Sarah Johnson</Text>
                <Text style={styles.upcomingTime}>Today • 3:00 PM</Text>
              </View>
              <TouchableOpacity style={styles.upcomingPlay}>
                <Ionicons name="play" size={16} color="#CC2222" />
              </TouchableOpacity>
            </View>

            <View style={styles.upcomingItem}>
              <View style={[styles.upcomingDot, { backgroundColor: '#22CC55' }]} />
              <View style={styles.upcomingContent}>
                <Text style={styles.upcomingName}>Team Meeting Recording</Text>
                <Text style={styles.upcomingTime}>Tomorrow • 10:30 AM</Text>
              </View>
              <TouchableOpacity style={styles.upcomingPlay}>
                <Ionicons name="play" size={16} color="#CC2222" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  topSection: {
    backgroundColor: '#F5F0F0',
    paddingBottom: 0,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A0505',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  tutorialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139,58,58,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 30,
    gap: 8,
    width: '100%',
  },
  tutorialText: {
    flex: 1,
    fontSize: 12,
    color: '#8B3A3A',
    lineHeight: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1A0505',
  },
  recordingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#CC2222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingPulse: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(204,34,34,0.3)',
    position: 'absolute',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 80,
    marginBottom: 20,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#CC2222',
  },
  recordingStatus: {
    fontSize: 14,
    color: '#8B3A3A',
    marginBottom: 20,
  },
  mainInstruction: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A0505',
    textAlign: 'center',
    lineHeight: 32,
  },
  subInstruction: {
    fontSize: 16,
    fontWeight: '400',
    color: '#8B3A3A',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#1A0505',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    marginTop: -10,
  },
  handleBarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  startButton: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  controlButton: {
    alignItems: 'center',
    gap: 6,
  },
  controlButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  mainControlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  mainControlGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingSection: {
    marginTop: 20,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(220,80,80,0.15)',
  },
  upcomingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CC2222',
    marginRight: 12,
  },
  upcomingContent: {
    flex: 1,
  },
  upcomingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  upcomingTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
  upcomingPlay: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(204,34,34,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220,80,80,0.35)',
  },
});