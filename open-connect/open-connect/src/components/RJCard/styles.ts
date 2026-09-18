import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    width: width * 0.5,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  imageWrapper: {
    position: 'relative',
    height: 130,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    flexDirection: 'row',
    gap: 3,
  },
  wave: {
    width: 3,
    height: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
  },
  waveDelay1: {
    height: 18,
  },
  waveDelay2: {
    height: 8,
  },
  content: {
    padding: 12,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  showName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  timeSlot: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  listenersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listenerIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  listenerCount: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  liveIndicator: {
    marginTop: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  listenGradient: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  listenText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});