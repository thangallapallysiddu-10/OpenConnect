import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    width: width * 0.35, // Match Recently Played card width
    borderRadius: 12, // Match Recently Played border radius
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: width * 0.35, // Make it square like Recently Played
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,59,59,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  frequencyBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    boxShadow: '0px 1px 2px rgba(0,0,0,0.3)',
    elevation: 2,
  },
  frequencyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    padding: 10,
  },
  stationName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tag: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 6,
  },
  city: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listenerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listenerIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  listenerCount: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '500',
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0px 1px 2px rgba(0,0,0,0.2)',
    elevation: 2,
  },
  playGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});