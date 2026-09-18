import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: '#110000',
},
 backgroundImage: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  opacity: 0.6,  // was 0.08, bring it back up
},
backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginTop:40, 
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 10,
  },
  headerRight: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  
  heroContainer: {
  position: 'absolute',
  bottom: 140,     // ← sits just above the button (which is at bottom: 50)
  left: 20,
  right: 20,
  zIndex: 5,
  marginBottom: 30,
},
  heroTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 44,
    marginBottom: 16,
    letterSpacing: 0.5,
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    width: '85%',
    opacity: 0.9,
    marginBottom: 8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    zIndex: 5,
    marginBottom: 50,
  },
  // Add this to your styles object
headerRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  paddingHorizontal: 20,
  paddingTop: 10,
},
 startButton: {
  alignSelf: 'flex-start',
  borderWidth: 1.5,
  borderColor: 'rgba(255, 100, 100, 0.4)',
  borderRadius: 30,
  boxShadow: '0 4px 8px rgba(255,100,100,0.4)',
  elevation: 10,
  
},
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});