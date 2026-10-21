import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Platform,
    StatusBar as RNStatusBar,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const SBH = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 44) : 44;

type LocalFile = {
  id: number;
  name: string;
  artist: string;
  duration: string;
  size: string;
  uri?: string;
};

const MOCK_FILES: LocalFile[] = [
  { id: 1, name: 'Blinding Lights',   artist: 'The Weeknd',    duration: '3:20', size: '4.2 MB' },
  { id: 2, name: 'Levitating',        artist: 'Dua Lipa',      duration: '3:23', size: '3.8 MB' },
  { id: 3, name: 'Stay',              artist: 'Kid LAROI',     duration: '2:21', size: '2.9 MB' },
  { id: 4, name: 'As It Was',         artist: 'Harry Styles',  duration: '2:37', size: '3.1 MB' },
  { id: 5, name: 'Heat Waves',        artist: 'Glass Animals', duration: '3:59', size: '5.0 MB' },
];

export default function LocalFilesScreen() {
  const [files, setFiles]       = useState<LocalFile[]>(MOCK_FILES);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    try {
      setImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newFiles: LocalFile[] = result.assets.map((asset, index) => {
          // Strip extension for display name
          const rawName = asset.name ?? 'Unknown Track';
          const displayName = rawName.replace(/\.[^/.]+$/, '');
          // Format file size
          const bytes = asset.size ?? 0;
          const sizeMB = bytes > 0 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : 'Unknown';

          return {
            id: Date.now() + index,
            name: displayName,
            artist: 'Local File',
            duration: '--:--',
            size: sizeMB,
            uri: asset.uri,
          };
        });

        setFiles(prev => [...prev, ...newFiles]);
      }
    } catch (e) {
      // User cancelled or error — do nothing
    } finally {
      setImporting(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#0A0012', '#10001A', '#0A0012']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: SBH + 14 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, paddingLeft: 12 }}>
          <Text style={styles.headerTitle}>Local Files</Text>
          <Text style={styles.headerSub}>{files.length} tracks on device</Text>
        </View>
        <TouchableOpacity
          style={[styles.importBtn, importing && { opacity: 0.6 }]}
          onPress={handleImport}
          activeOpacity={0.85}
          disabled={importing}
        >
          <Ionicons name="add" size={18} color="#8B5CF6" />
          <Text style={styles.importTxt}>{importing ? 'Picking...' : 'Import'}</Text>
        </TouchableOpacity>
      </View>

      {files.length === 0 ? (
        /* ── Empty state ── */
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="musical-notes-outline" size={48} color="rgba(139,92,246,0.5)" />
          </View>
          <Text style={styles.emptyTitle}>No local files yet</Text>
          <Text style={styles.emptyDesc}>
            Import audio files from your device to play them here
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={handleImport} activeOpacity={0.85}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.emptyBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="folder-open-outline" size={18} color="#fff" />
              <Text style={styles.emptyBtnTxt}>Browse Files</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <TouchableOpacity
              style={styles.importBanner}
              onPress={handleImport}
              activeOpacity={0.85}
              disabled={importing}
            >
              <LinearGradient
                colors={['rgba(139,92,246,0.15)', 'rgba(139,92,246,0.05)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <Ionicons name="folder-open-outline" size={20} color="#8B5CF6" />
              <Text style={styles.importBannerTxt}>
                {importing ? 'Opening file picker...' : 'Import more files from device'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(139,92,246,0.7)" />
            </TouchableOpacity>
          }
          renderItem={({ item, index }) => {
            const isPlaying = playingId === item.id;
            return (
              <TouchableOpacity
                style={[styles.fileCard, isPlaying && styles.fileCardActive]}
                activeOpacity={0.88}
                onPress={() => setPlayingId(isPlaying ? null : item.id)}
              >
                {isPlaying && (
                  <LinearGradient
                    colors={['transparent', 'rgba(139,92,246,0.1)']}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                {/* Track number / wave indicator */}
                <View style={styles.trackNumWrap}>
                  {isPlaying ? (
                    <View style={styles.waveWrap}>
                      {[0.6, 1, 0.7].map((h, i) => (
                        <View key={i} style={[styles.wavebar, { height: 14 * h }]} />
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.trackNum}>{String(index + 1).padStart(2, '0')}</Text>
                  )}
                </View>

                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.fileArtist}>{item.artist}</Text>
                </View>

                <View style={styles.fileMeta}>
                  <Text style={styles.fileDuration}>{item.duration}</Text>
                  <Text style={styles.fileSize}>{item.size}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.filePlayBtn, isPlaying && styles.filePlayBtnActive]}
                  onPress={() => setPlayingId(isPlaying ? null : item.id)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={16}
                    color="#fff"
                    style={!isPlaying ? { marginLeft: 2 } : undefined}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: '#0A0012' },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
  backBtn:         { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  headerTitle:     { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.6 },
  headerSub:       { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2, fontWeight: '500' },
  importBtn:       { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(139,92,246,0.15)', borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  importTxt:       { fontSize: 13, fontWeight: '700', color: '#8B5CF6' },
  list:            { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },
  importBanner:    { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)', padding: 14, marginBottom: 16, overflow: 'hidden' },
  importBannerTxt: { flex: 1, fontSize: 13, fontWeight: '600', color: 'rgba(139,92,246,0.9)' },
  fileCard:        { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.03)', padding: 14, overflow: 'hidden' },
  fileCardActive:  { borderColor: 'rgba(139,92,246,0.4)', backgroundColor: 'rgba(139,92,246,0.06)' },
  trackNumWrap:    { width: 28, alignItems: 'center' },
  trackNum:        { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.3)' },
  waveWrap:        { flexDirection: 'row', alignItems: 'center', gap: 2 },
  wavebar:         { width: 3, borderRadius: 2, backgroundColor: '#8B5CF6' },
  fileInfo:        { flex: 1 },
  fileName:        { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 3, letterSpacing: -0.2 },
  fileArtist:      { fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
  fileMeta:        { alignItems: 'flex-end', gap: 3 },
  fileDuration:    { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  fileSize:        { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: '500' },
  filePlayBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(139,92,246,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(139,92,246,0.4)' },
  filePlayBtnActive:{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  emptyState:      { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon:       { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(139,92,246,0.1)', borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle:      { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 10, letterSpacing: -0.4 },
  emptyDesc:       { fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  emptyBtn:        { borderRadius: 28, overflow: 'hidden' },
  emptyBtnGrad:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 28, paddingVertical: 14 },
  emptyBtnTxt:     { fontSize: 15, fontWeight: '700', color: '#fff' },
});