import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

const moods = ['Happy', 'Chill', 'Workout', 'Focus', 'Party', 'Sleep', 'Romantic'];

export default function MoodSelector() {
  const { colors } = useTheme();
  const [activeMood, setActiveMood] = useState('Chill');

  // Selecting a mood now carries the user into the search experience
  // pre-filtered for that mood, instead of only highlighting the chip.
  const pickMood = (mood: string) => {
    setActiveMood(mood);
    router.push(`/search?mood=${encodeURIComponent(mood)}` as any);
  };

  return (
    <View style={S.container}>
      <Text style={[S.title, { color: colors.text }]}>What's your mood?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.scrollContent}>
        {moods.map((mood) => {
          const isActive = activeMood === mood;
          
          if (isActive) {
            return (
              <TouchableOpacity key={mood} activeOpacity={0.8} onPress={() => pickMood(mood)}>
                <LinearGradient
                  colors={['#8B5CF6', '#A855F7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[S.chip, S.activeChip]}
                >
                  <Text style={[S.chipText, { color: 'white', fontWeight: '700' }]}>{mood}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity 
              key={mood} 
              activeOpacity={0.8} 
              onPress={() => pickMood(mood)}
              style={[S.chip, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: colors.border, borderWidth: 1 }]}
            >
              <Text style={[S.chipText, { color: colors.text }]}>{mood}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  chip: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  activeChip: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  }
});
