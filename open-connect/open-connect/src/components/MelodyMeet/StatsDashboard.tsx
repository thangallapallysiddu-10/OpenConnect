import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const stats = [
  { label: 'Total Songs', value: '1.2M', icon: 'musical-notes', growth: '+12%', color: '#8B5CF6' },
  { label: 'Active Users', value: '8.4M', icon: 'people', growth: '+5.2%', color: '#EC4899' },
  { label: 'Total Streams', value: '45.2B', icon: 'play-circle', growth: '+18%', color: '#A855F7' },
  { label: 'Artists', value: '250K', icon: 'mic', growth: '+2.1%', color: '#3B82F6' },
  { label: 'Playlists', value: '4.1M', icon: 'list', growth: '+8.4%', color: '#10B981' }
];

export default function StatsDashboard() {
  const { colors } = useTheme();

  return (
    <View style={S.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.scrollContent}>
        {stats.map((stat, index) => (
          <View 
            key={index} 
            style={[S.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          >
            <View style={S.header}>
              <View style={[S.iconBox, { backgroundColor: `${stat.color}20` }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <View style={S.growthBox}>
                <Ionicons name="trending-up" size={12} color="#10B981" />
                <Text style={S.growthText}>{stat.growth}</Text>
              </View>
            </View>
            <View style={S.info}>
              <Text style={[S.value, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[S.label, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 16,
    paddingBottom: 8,
  },
  statCard: {
    width: 160,
    height: 120,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  growthBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  growthText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  info: {
    marginTop: 'auto',
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  }
});
