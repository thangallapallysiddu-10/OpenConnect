import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    width: width * 0.55,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  imageContainer: {
    position: 'relative',
    height: 150,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  micOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  micIcon: {
    fontSize: 20,
  },
  content: {
    padding: 12,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 20,
  },
  host: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 8,
  },
  episodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  episodeIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  episodeCount: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  playButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});