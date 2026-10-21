import React, { useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useFilter } from '../../src/context/FilterContext';
import { useFavorites } from '../../src/context/FavoritesContext';
import { ALL_CHANNELS, LANGUAGES } from '../../src/data/channels';

export default function AllChannelsScreen() {
  const { theme, colors } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const { globalLanguage: selectedLanguage, setGlobalLanguage: setSelectedLanguage } = useFilter();
  const [tempLanguage, setTempLanguage] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;
  const sheetWidth = Math.min(windowWidth, 480);
  const sheetLeft = windowWidth > 480 ? (windowWidth - 480) / 2 : 0;

  const filterBackdropOpacity = useRef(new Animated.Value(0)).current;
  const filterSheetTranslateY = useRef(new Animated.Value(600)).current;

  const openFilter = () => {
    setTempLanguage(selectedLanguage);
    setShowFilter(true);
    Animated.parallel([
      Animated.timing(filterBackdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(filterSheetTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 220,
      }),
    ]).start();
  };

  const closeFilter = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(filterBackdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(filterSheetTranslateY, {
        toValue: 600,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowFilter(false);
      cb?.();
    });
  };

  // Filter channels based on search and language
  const filteredChannels = ALL_CHANNELS.filter(
    (item) => {
      const matchesSearch = item.channelNumber.toString().includes(searchQuery) ||
        item.frequencyStr.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLang = selectedLanguage === '' || item.language === selectedLanguage;
      return matchesSearch && matchesLang;
    }
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Background Gradient */}
      <LinearGradient
        colors={colors.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={isDesktop ? { width: '100%', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', flex: 1 } : { flex: 1 }}>
          {/* Page Header */}
          <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 16 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.headerBtnBg,
              borderColor: colors.headerBtnBorder,
              borderWidth: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          
          <View>
            <Text style={{ color: colors.text }} className="text-xl font-bold tracking-tight">
              All Channels
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-[11px] font-semibold">
              100 live radio frequencies
            </Text>
          </View>
        </View>

        {/* Divider line */}
        <View style={{ height: 1, backgroundColor: colors.border }} />

        {/* Search Bar */}
        <View className="px-4 py-3 flex-row items-center gap-2">
          <View
            style={{
              flex: 1,
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              borderWidth: 1,
            }}
            className="flex-row items-center px-4 h-12 rounded-2xl"
          >
            <Ionicons name="search" size={20} color={colors.textSecondary} className="mr-2" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search..."
              placeholderTextColor={colors.textSecondary}
              style={{ color: colors.text, flex: 1, fontSize: 14 }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={openFilter}
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              borderWidth: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="filter" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {showFilter && (
          <Modal
            transparent={true}
            animationType="none"
            onRequestClose={() => closeFilter()}
          >
            <TouchableOpacity
              className="absolute inset-0"
              activeOpacity={1}
              onPress={() => closeFilter()}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    opacity: filterBackdropOpacity,
                    backgroundColor: 'rgba(0, 0, 0, 0.45)',
                  },
                ]}
              />
            </TouchableOpacity>

            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [{ translateY: filterSheetTranslateY }],
                  backgroundColor: colors.cardBackground,
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                  borderWidth: 1,
                  borderColor: colors.border,
                  width: sheetWidth,
                  left: sheetLeft,
                  right: windowWidth > 480 ? 'auto' : 0,
                },
              ]}
            >
              {/* Top Orange Indicator Bar */}
              <View style={{ height: 4, backgroundColor: '#D97706', borderTopLeftRadius: 28, borderTopRightRadius: 28 }} />

              {/* Drag Handle Indicator */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => closeFilter()}
                className="py-2.5 items-center justify-center"
              >
                <View style={{ backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }} className="h-1.5 w-12 rounded-full" />
              </TouchableOpacity>

              {/* Filter Title */}
              <View className="px-5 pb-3 flex-row justify-between items-center">
                <Text style={{ color: colors.textSecondary }} className="text-[11px] font-extrabold tracking-wider uppercase">
                  FILTER CHANNELS
                </Text>
                {tempLanguage !== '' && (
                  <TouchableOpacity onPress={() => setTempLanguage('')}>
                    <Text style={{ color: '#F59E0B' }} className="text-[11px] font-bold uppercase tracking-wider">
                      Clear
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Divider line */}
              <View style={{ height: 1, backgroundColor: colors.border }} />

              {/* Languages List */}
              <ScrollView showsVerticalScrollIndicator={false} className="px-2 mt-2" contentContainerStyle={{ paddingBottom: 24 }}>
                <TouchableOpacity
                  style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                  className="flex-row items-center justify-between px-4 py-4"
                  onPress={() => setTempLanguage('')}
                >
                   <Text style={{ color: colors.text }} className="text-sm font-bold tracking-wide flex-1">All Languages</Text>
                   {tempLanguage === '' && <Ionicons name="checkmark" size={20} color="#F59E0B" />}
                </TouchableOpacity>
                
                {LANGUAGES.map(lang => (
                  <TouchableOpacity
                    key={lang}
                    style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                    className="flex-row items-center justify-between px-4 py-4"
                    onPress={() => setTempLanguage(lang)}
                  >
                     <Text style={{ color: colors.text }} className="text-sm font-bold tracking-wide flex-1">{lang}</Text>
                     {tempLanguage === lang && <Ionicons name="checkmark" size={20} color="#F59E0B" />}
                  </TouchableOpacity>
                ))}

                {/* Submit button placed inside the sheet at the bottom */}
                <View className="px-4 mt-6">
                  <TouchableOpacity
                    style={{ backgroundColor: '#F59E0B', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                    onPress={() => {
                      setSelectedLanguage(tempLanguage);
                      closeFilter();
                    }}
                  >
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Apply Filter</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </Modal>
        )}

        {/* Channel List */}
        <FlatList
          data={filteredChannels}
          keyExtractor={(item) => item.channelNumber.toString()}
          contentContainerClassName="pb-10"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 px-4">
              <Ionicons name="radio-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.4 }} />
              <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mt-4">
                No channels match your query
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '/livestations/stations',
                  params: { channel: item.channelNumber.toString(), autoplay: 'true' },
                });
              }}
              style={{
                borderBottomWidth: 1,
                borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              }}
              className="flex-row items-center justify-between py-4 px-5"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1 mr-4">
                {/* Zero-padded channel index */}
                <View style={{ width: 40 }}>
                  <Text 
                    style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)' }} 
                    className="text-sm font-extrabold tracking-tight"
                  >
                    {String(item.channelNumber).padStart(2, '0')}
                  </Text>
                </View>
                
                <View>
                  <Text style={{ color: colors.text }} className="text-base font-extrabold tracking-tight">
                    {item.frequencyStr}
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="text-[11px] font-semibold mt-0.5">
                    Channel {item.channelNumber} • {item.language}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite({ 
                      id: item.channelNumber.toString(), 
                      title: item.name, 
                      subtitle: `Channel ${item.channelNumber} • ${item.language}`, 
                      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80', 
                      type: 'station', 
                      rawData: item 
                    });
                  }}
                  className="mr-2"
                >
                  <Ionicons name={isFavorite(item.channelNumber.toString()) ? "heart" : "heart-outline"} size={22} color={isFavorite(item.channelNumber.toString()) ? "#EC4899" : colors.textSecondary} />
                </TouchableOpacity>
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mr-1">
                  Listen
                </Text>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: theme === 'dark' ? 'rgba(236, 72, 153, 0.12)' : 'rgba(139, 92, 246, 0.08)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons 
                    name="play" 
                    size={14} 
                    color={theme === 'dark' ? '#EC4899' : '#8B5CF6'} 
                    style={{ marginLeft: 1.5 }} 
                  />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
});
