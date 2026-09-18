import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Alert,
  FlatList,
} from 'react-native';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';

const UPCOMING_EVENTS = [
  { id: '1', title: 'DJ Aryan Live Mix', type: 'Live Stream', time: 'Starts in 15 mins', icon: 'radio-outline', color: '#8B5CF6' },
  { id: '2', title: 'The Music Lab: Indie Edition', type: 'Podcast', time: 'Starts in 1 hour', icon: 'mic-outline', color: '#F59E0B' },
  { id: '3', title: 'Late Night Lofi', type: 'Live Radio', time: 'Starts tonight at 10 PM', icon: 'musical-notes-outline', color: '#10B981' },
];

export const NotificationsModal = () => {
  const { showNotificationsModal, closeNotifications } = useNotifications();
  const { colors, isDark } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(windowHeight)).current;

  useEffect(() => {
    if (showNotificationsModal) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: windowHeight, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [showNotificationsModal]);

  const [selectedItem, setSelectedItem] = React.useState<typeof UPCOMING_EVENTS[0] | null>(null);
  const [confirmType, setConfirmType] = React.useState<'optIn' | 'optOut' | null>(null);
  const [optedInEvents, setOptedInEvents] = React.useState<string[]>([]);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleOptIn = (item: typeof UPCOMING_EVENTS[0]) => {
    setSelectedItem(item);
    setConfirmType('optIn');
  };

  const handleOptOut = (item: typeof UPCOMING_EVENTS[0]) => {
    setSelectedItem(item);
    setConfirmType('optOut');
  };

  const handleConfirmYes = () => {
    if (selectedItem) {
      if (confirmType === 'optIn') {
        setOptedInEvents(prev => [...prev, selectedItem.id]);
        setSuccessMessage('We will notify u');
      } else if (confirmType === 'optOut') {
        setOptedInEvents(prev => prev.filter(id => id !== selectedItem.id));
      }
    }
    setSelectedItem(null);
    setConfirmType(null);
  };

  const handleConfirmNo = () => {
    setSelectedItem(null);
    setConfirmType(null);
  };

  const handleCloseSuccess = () => {
    setSuccessMessage(null);
  };

  if (!showNotificationsModal) return null;

  const isMobile = windowWidth < 600;

  return (
    <Modal transparent animationType="none" visible={showNotificationsModal} onRequestClose={closeNotifications}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeNotifications}>
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity, backgroundColor: 'rgba(0,0,0,0.6)' }]} />
      </TouchableOpacity>

      <View style={[styles.modalContainer, { justifyContent: isMobile ? 'flex-end' : 'center' }]} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.modalBox,
            {
              width: isMobile ? '100%' : 400,
              height: isMobile ? '70%' : 500,
              backgroundColor: isDark ? '#14141A' : '#FFFFFF',
              borderColor: colors.border,
              transform: [{ translateY: slideAnim }],
              borderBottomLeftRadius: isMobile ? 0 : 24,
              borderBottomRightRadius: isMobile ? 0 : 24,
            },
          ]}
        >
          {isMobile && (
            <View style={styles.handleBarContainer}>
              <View style={[styles.handleBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]} />
            </View>
          )}

          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
            <TouchableOpacity onPress={closeNotifications} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={UPCOMING_EVENTS}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => {
              const isOptedIn = optedInEvents.includes(item.id);
              return (
                <View style={[styles.notificationItem, { borderBottomColor: colors.border }]}>
                  <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemType, { color: item.color }]}>{item.type}</Text>
                    <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.itemTime, { color: colors.textMuted }]}>{item.time}</Text>
                  </View>

                  {isOptedIn && (
                    <TouchableOpacity 
                      style={[styles.dotsBtn, { backgroundColor: 'transparent' }]} 
                      onPress={() => handleOptOut(item)}
                    >
                      <Ionicons name="notifications" size={20} color="#FFC107" />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    style={[styles.dotsBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} 
                    onPress={() => handleOptIn(item)}
                  >
                    <Text style={{ fontSize: 24, color: colors.text, fontWeight: 'bold', transform: [{ translateY: -2 }] }}>⋮</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </Animated.View>

        {/* Custom Confirmation Dialog */}
        {selectedItem && (
          <View style={styles.confirmOverlay}>
            <View style={[styles.confirmBox, { backgroundColor: isDark ? '#1C1C24' : '#FFFFFF', borderColor: colors.border }]}>
              <Text style={[styles.confirmTitle, { color: colors.text }]}>{confirmType === 'optIn' ? 'Notify Me' : 'Turn off Notification'}</Text>
              <Text style={[styles.confirmText, { color: colors.textMuted }]}>
                {confirmType === 'optIn' 
                  ? `Whenever "${selectedItem.title}" starts, we will notify you. Yes or No?`
                  : `Do you really want to off notification for "${selectedItem.title}"? Yes or No?`}
              </Text>
              
              <View style={styles.confirmActions}>
                <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]} onPress={handleConfirmNo}>
                  <Text style={[styles.confirmBtnText, { color: '#EF4444' }]}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#8B5CF6' }]} onPress={handleConfirmYes}>
                  <Text style={[styles.confirmBtnText, { color: '#FFFFFF' }]}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Success Message Dialog */}
        {successMessage && (
          <View style={styles.confirmOverlay}>
            <View style={[styles.confirmBox, { backgroundColor: isDark ? '#1C1C24' : '#FFFFFF', borderColor: colors.border, alignItems: 'center' }]}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" style={{ marginBottom: 16 }} />
              <Text style={[styles.confirmTitle, { color: colors.text, marginBottom: 24 }]}>{successMessage}</Text>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#8B5CF6', width: '100%', alignItems: 'center' }]} onPress={handleCloseSuccess}>
                <Text style={[styles.confirmBtnText, { color: '#FFFFFF' }]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    zIndex: 1001,
  },
  modalBox: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
    paddingBottom: 20,
  },
  handleBarContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  itemType: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemTime: {
    fontSize: 13,
  },
  dotsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  confirmBox: {
    width: 320,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  confirmText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  confirmBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
