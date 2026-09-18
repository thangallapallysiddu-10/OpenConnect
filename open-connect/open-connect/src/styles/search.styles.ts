import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const artistCardWidth = width * 0.3;
const playlistCardWidth = width * 0.7;
const moodCardWidth = width * 0.25;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingTop: 5,
    paddingBottom: 12,
    gap: 12,
    marginTop: 10,
  },
  searchContainer: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#1E1E1E',  // Dark gray background (NOT white)
  borderRadius: 12,
  paddingHorizontal: 16,
  height: 48,
  borderWidth: 1,
  borderColor: 'rgba(197, 165, 114, 0.15)',
},

searchInput: {
  flex: 1,
  color: '#FFFFFF',  // White text
  fontSize: 16,
  padding: 0,
},

backButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#1E1E1E',  // Match the search background
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'rgba(197, 165, 114, 0.2)',
},
  
  searchIcon: {
    marginRight: 12,
  },
  
  clearButton: {
    padding: 4,
  },
  section: {
    marginBottom: 32,
  },
  lastSection: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  seeAllText: {
    fontSize: 14,
    color: '#C5A572',
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // Mood Categories
  moodList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  moodCard: {
    width: moodCardWidth,
    height: moodCardWidth * 1.2,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
  },
  moodImage: {
    width: '100%',
    height: '100%',
  },
  moodOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  moodContent: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    right: 12,
  },
  moodIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  moodText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Recently Played
  recentlyPlayedList: {
    paddingHorizontal: 20,
  },
  recentlyPlayedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(197, 165, 114, 0.1)',
  },
  recentlyPlayedImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 16,
  },
  recentlyPlayedInfo: {
    flex: 1,
  },
  recentlyPlayedTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  recentlyPlayedArtist: {
    color: '#A0A0A0',
    fontSize: 14,
    fontWeight: '400',
  },
  recentlyPlayedPlays: {
    color: '#666',
    fontSize: 12,
    fontWeight: '400',
  },

  // Popular Artists
  artistsList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  artistCard: {
    width: artistCardWidth,
    height: artistCardWidth * 1.3,
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
  },
  artistImage: {
    width: '100%',
    height: '100%',
  },
  artistGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  artistInfo: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  artistName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  artistGenre: {
    color: '#E0E0E0',
    fontSize: 11,
    fontWeight: '400',
    marginBottom: 4,
  },
  artistFollowers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  artistFollowersText: {
    color: '#A0A0A0',
    fontSize: 10,
    fontWeight: '400',
  },

  // Curated Playlists
  playlistsList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  playlistCard: {
    width: playlistCardWidth,
    height: playlistCardWidth * 0.7,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
  },
  playlistImage: {
    width: '100%',
    height: '100%',
  },
  playlistOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  playlistContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  playlistBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  playlistBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  playlistTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  playlistDescription: {
    color: '#E0E0E0',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
  },
  playlistDuration: {
    color: '#A0A0A0',
    fontSize: 12,
    fontWeight: '400',
  },

  // Search Results
  resultsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(197, 165, 114, 0.1)',
  },
  resultImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  resultSubtitle: {
    color: '#A0A0A0',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultType: {
    backgroundColor: 'rgba(197, 165, 114, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resultTypeText: {
    color: '#C5A572',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
  resultYear: {
    color: '#666',
    fontSize: 12,
    fontWeight: '400',
  },
});