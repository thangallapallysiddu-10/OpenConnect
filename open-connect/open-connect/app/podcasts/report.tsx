import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { usePlayer } from '../../src/context/PlayerContext';

const REPORT_OPTIONS = [
  'Spam or misleading',
  'Offensive content',
  'Harassment or bullying',
  'Copyright violation',
  'False information',
  'Violence or harmful content',
  'Other',
];

export default function ReportPodcastScreen() {
  const params = useLocalSearchParams<{ podcastName?: string; returnHref?: string }>();
  const { pausePodcast } = usePlayer();

  const podcastName = useMemo(() => String(params.podcastName ?? 'Podcast'), [params.podcastName]);
  const returnHref = useMemo(() => (params.returnHref ? String(params.returnHref) : ''), [params.returnHref]);

  const contentFade = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    pausePodcast();
    Animated.parallel([
      Animated.timing(contentFade, { toValue: 1, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(contentY, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [contentFade, contentY, pausePodcast]);

  const handleClose = () => {
    if (returnHref) router.dismissTo(returnHref as any);
    else router.back();
  };

  return (
    <View style={S.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0F0" />
      <SafeAreaView style={S.safe}>
        <Animated.View style={[S.header, { opacity: contentFade, transform: [{ translateY: contentY }] }]}>
          <TouchableOpacity style={S.headerBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color="#1A0505" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Report Podcast</Text>
          <TouchableOpacity style={S.headerBtn} onPress={handleClose} activeOpacity={0.8}>
            <Ionicons name="close" size={22} color="#1A0505" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ flex: 1, opacity: contentFade, transform: [{ translateY: contentY }] }}>
          <View style={S.subHeader}>
            <Text style={S.subTitle} numberOfLines={2}>{podcastName}</Text>
            <Text style={S.subDesc}>Select a reason to continue</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.list}>
            {REPORT_OPTIONS.map(option => (
              <TouchableOpacity
                key={option}
                style={S.optionRow}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: '/podcasts/report-option',
                    params: { podcastName, option, returnHref },
                  })
                }
              >
                <Text style={S.optionText}>{option}</Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(26,5,5,0.35)" />
              </TouchableOpacity>
            ))}
            <View style={{ height: 14 }} />
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const S: Record<string, any> = {
  container: { flex: 1, backgroundColor: '#F5F0F0' },
  safe: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingBottom: 12 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#1A0505' },
  subHeader: { paddingTop: 8, paddingBottom: 12 },
  subTitle: { fontSize: 15, fontWeight: '700', color: '#1A0505', marginBottom: 4 },
  subDesc: { fontSize: 12, color: 'rgba(26,5,5,0.55)', fontWeight: '600' },
  list: { paddingTop: 6, paddingBottom: 18, gap: 10 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(26,5,5,0.06)' },
  optionText: { fontSize: 14, fontWeight: '700', color: '#1A0505' },
};
