import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { usePlayer } from '../../src/context/PlayerContext';

export default function ReportOptionScreen() {
  const params = useLocalSearchParams<{ podcastName?: string; option?: string; returnHref?: string }>();
  const { pausePodcast } = usePlayer();

  const podcastName = useMemo(() => String(params.podcastName ?? 'Podcast'), [params.podcastName]);
  const option = useMemo(() => String(params.option ?? ''), [params.option]);
  const returnHref = useMemo(() => (params.returnHref ? String(params.returnHref) : ''), [params.returnHref]);

  const [details, setDetails] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const contentFade = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    pausePodcast();
    Animated.parallel([
      Animated.timing(contentFade, { toValue: 1, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(contentY, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [contentFade, contentY, pausePodcast]);

  const handleCloseAll = () => {
    if (returnHref) router.dismissTo(returnHref as any);
    else router.back();
  };

  const handleOk = () => {
    setConfirmOpen(false);
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
          <Text style={S.headerTitle}>User pressed report option</Text>
          <TouchableOpacity style={S.headerBtn} onPress={handleCloseAll} activeOpacity={0.8}>
            <Ionicons name="close" size={22} color="#1A0505" />
          </TouchableOpacity>
        </Animated.View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <Animated.View style={[S.body, { opacity: contentFade, transform: [{ translateY: contentY }] }]}>
            {!!option && (
              <View style={S.pill}>
                <Ionicons name="flag-outline" size={14} color="#CC2222" />
                <Text style={S.pillText}>{option}</Text>
              </View>
            )}

            <TextInput
              style={S.input}
              placeholder="Write additional details here..."
              placeholderTextColor="rgba(26,5,5,0.35)"
              value={details}
              onChangeText={setDetails}
              multiline
              textAlignVertical="top"
            />
            <View style={S.footer}>
              <TouchableOpacity style={[S.btn, S.btnGhost]} onPress={() => router.back()} activeOpacity={0.85}>
                <Text style={[S.btnText, S.btnGhostText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[S.btn, S.btnPrimary]} onPress={() => setConfirmOpen(true)} activeOpacity={0.9}>
                <Text style={[S.btnText, S.btnPrimaryText]}>Submit</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal transparent visible={confirmOpen} animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View style={C.overlay}>
          <View style={C.card}>
            <Text style={C.title} numberOfLines={2}>{podcastName}</Text>
            <Text style={C.message}>Report is submitted successfully.</Text>
            <TouchableOpacity style={C.okBtn} onPress={handleOk} activeOpacity={0.9}>
              <Text style={C.okText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const S: Record<string, any> = {
  container: { flex: 1, backgroundColor: '#F5F0F0' },
  safe: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingBottom: 12 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#1A0505' },
  body: { flex: 1, paddingTop: 10, gap: 12 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: 'rgba(204,34,34,0.08)', borderWidth: 1, borderColor: 'rgba(204,34,34,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: '800', color: '#1A0505' },
  input: { height: '45%', minHeight: 180, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(26,5,5,0.08)', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1A0505', lineHeight: 20 },
  footer: { flexDirection: 'row', gap: 12, paddingTop: 12 },
  btn: { flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnGhost: { backgroundColor: 'rgba(0,0,0,0.06)', borderWidth: 1, borderColor: 'rgba(26,5,5,0.08)' },
  btnPrimary: { backgroundColor: '#CC0000' },
  btnText: { fontSize: 14, fontWeight: '900' },
  btnGhostText: { color: '#1A0505' },
  btnPrimaryText: { color: '#FFFFFF' },
};

const C: Record<string, any> = {
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(26,5,5,0.08)' },
  title: { fontSize: 15, fontWeight: '900', color: '#1A0505', marginBottom: 6 },
  message: { fontSize: 13, color: 'rgba(26,5,5,0.65)', fontWeight: '600', marginBottom: 14, lineHeight: 18 },
  okBtn: { height: 44, borderRadius: 14, backgroundColor: '#1A0505', alignItems: 'center', justifyContent: 'center' },
  okText: { fontSize: 14, fontWeight: '900', color: '#FFFFFF' },
};
