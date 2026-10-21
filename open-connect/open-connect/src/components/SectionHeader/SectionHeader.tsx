import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { styles } from './styles';

interface SectionHeaderProps {
  title: string;
  onSeeAllPress?: () => void;
}

export const SectionHeader = ({ title, onSeeAllPress }: SectionHeaderProps) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <View style={styles.accentLine} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
        <Text style={[styles.seeAll, { color: colors.textSecondary }]}>See All</Text>
      </TouchableOpacity>
    </View>
  );
};