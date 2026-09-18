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
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function RecordingPreviewScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingName, setRecordingName] = useState('My Recording');
  
  // Animation values
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(20)).current;

  useEffect(() => {
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
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    // Save recording logic here
    router.dismissTo('/podcasts/discover');
  };

  const contentStyle = {
    opacity: contentFade,
    transform: [{ translateY: contentTranslate }],
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1A0505' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0505" />

      <LinearGradient
        colors={['#2a0000', '#1a0000', '#0f0000', '#000000']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      <View style={styles.topSection}>
        <SafeAreaView>
          <Animated.View style={contentStyle}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={22} color="#1A0505" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Preview Recording</Text>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View style={[styles.contentContainer, contentStyle]}>
            <View style={styles.waveformLarge}>
              {[24, 32, 40, 48, 56, 48, 40, 32, 24].map((height, index) => (
                <View
                  key={index}
                  style={[
                    styles.waveformBarLarge,
                    { height, backgroundColor: index === 4 ? '#CC2222' : '#CC2222' },
                  ]}
                />
              ))}
            </View>

            <TextInput
              style={styles.nameInput}
              value={recordingName}
              onChangeText={setRecordingName}
              placeholder="Recording name"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />

            <Text style={styles.durationText}>03:24 • 2.4 MB</Text>
          </Animated.View>
        </SafeAreaView>
      </View>

      <Animated.View style={[styles.bottomSection, contentStyle]}>
        <View style={styles.handleBarContainer}>
          <View style={styles.handleBar} />
        </View>

        <View style={styles.previewControls}>
          <TouchableOpacity style={styles.previewButton}>
            <Ionicons name="play-skip-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <LinearGradient
              colors={['#CC0000', '#8B0000']}
              style={styles.playButtonGradient}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.previewButton}>
            <Ionicons name="play-skip-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
  style={styles.actionButton} 
  onPress={() => router.back()} // Go back to recording screen
>
  <Ionicons name="trash-outline" size={22} color="#CC2222" />
  <Text style={styles.actionButtonText}>Discard</Text>
</TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Ionicons name="checkmark-circle-outline" size={22} color="#22CC55" />
            <Text style={styles.actionButtonText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={22} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#CC2222',
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
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
  waveformLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 120,
    marginVertical: 30,
  },
  waveformBarLarge: {
    width: 6,
    borderRadius: 3,
    backgroundColor: '#CC2222',
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A0505',
    textAlign: 'center',
    marginBottom: 8,
    padding: 8,
    width: '100%',
  },
  durationText: {
    fontSize: 14,
    color: '#8B3A3A',
    marginBottom: 20,
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
  previewControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 40,
  },
  previewButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
});