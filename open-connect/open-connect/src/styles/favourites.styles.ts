import { Platform, StatusBar, StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: '#121212',
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
},
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
  fontSize: 28,
  fontWeight: '700',
  color: '#FFFFFF',
  letterSpacing: 0.5,
  flex: 1,               // ← takes up middle space
  textAlign: 'left', 
  marginLeft: 8,  // ← stays centered between back + menu
},
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#C5A572',
  },
  tabText: {
    fontSize: 15,
    color: '#808080',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    padding: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  sortButton: {
    fontSize: 13,
    color: '#C5A572',
    fontWeight: '500',
  },
  contentContainer: {
    paddingBottom: 130,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: 4,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#808080',
  },
  itemMenu: {
    padding: 8,
  },
  extraSubtitleContainer: {
    paddingLeft: 72,
    marginTop: -4,
    marginBottom: 4,
  },
  extraSubtitle: {
    fontSize: 12,
    color: '#808080',
  },
});