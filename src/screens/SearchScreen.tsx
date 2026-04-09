import { useMusic } from "@/context/MusicContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { apiService } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import { 
  ArrowLeft, ArrowRightCircle, ChevronLeft, Disc, Heart, Info, ListPlus, 
  MoreHorizontal, MoreVertical, Music, Pause, PhoneCall, 
  Play, PlayCircle, PlusCircle, Search, Send, Trash2, User, X, XCircle 
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const TABS = ["Songs", "Artists", "Albums", "Playlists"];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const [searchResults, setSearchResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState("Songs");

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { playSong, currentSong, isPlaying, pauseSong, resumeSong } = useMusic();
  const navigation = useNavigation<any>();

  // Action Modal State
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedActionSong, setSelectedActionSong] = useState<any>(null);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem("recentSearches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load recents", error);
    }
  };

  const saveRecentSearch = async (searchTerm: string) => {
    try {
      if (!searchTerm) return;
      const updated = [searchTerm, ...recentSearches.filter(q => q !== searchTerm)].slice(0, 10);
      setRecentSearches(updated);
      await AsyncStorage.setItem("recentSearches", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save recent", error);
    }
  };

  const clearAllRecents = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem("recentSearches");
  };

  const removeRecentSearch = async (termToRemove: string) => {
    const updated = recentSearches.filter(q => q !== termToRemove);
    setRecentSearches(updated);
    await AsyncStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearchSubmit = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      saveRecentSearch(query.trim());
      const data = await apiService.globalSearch(query.trim());
      setSearchResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClear = () => {
    setQuery("");
    setHasSearched(false);
    setSearchResults({});
  };

  const navigateToRecent = (term: string) => {
    setQuery(term);
    // Since setQuery is async to the render cycle, we trigger search locally
    (async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        saveRecentSearch(term);
        const data = await apiService.globalSearch(term);
        setSearchResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleSongPress = useCallback(async (item: any) => {
    if (currentSong?.id === item.id) {
      navigation.navigate("Player");
    } else {
      let songToPlay = item;
      if (!songToPlay.downloadUrl) {
        try {
          songToPlay = await apiService.getSongDetails(item.id);
        } catch (err) {
          console.error("Failed to fetch song details for playing", err);
        }
      }
      await playSong(songToPlay);
      navigation.navigate("Player");
    }
  }, [currentSong?.id, playSong, navigation]);

  const renderTabs = () => {
    if (!hasSearched) return null;
    return (
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabPill,
                { borderColor: isDark ? "#444" : "#E0E0E0" },
                activeTab === tab && styles.tabPillActive
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isDark ? "#FFFFFF" : "#000000" },
                  activeTab === tab && styles.tabTextActive
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image 
        source={{ uri: Image.resolveAssetSource(require("@/assets/images/not-found.png")).uri }} 
        style={styles.emptyImage}
        resizeMode="contain" 
      />
      <Text style={[styles.emptyTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}>Not Found</Text>
      <Text style={[styles.emptySubtitle, { color: isDark ? "#9E9E9E" : "#616161" }]}>
        Sorry, the keyword you entered cannot be found, please check again or search with another keyword.
      </Text>
    </View>
  );

  const getActiveArrayLength = () => {
    const list = getActiveList();
    return list ? list.length : 0;
  };

  const getActiveList = () => {
    if (!searchResults) return [];
    if (activeTab === "Songs") return searchResults.songs?.results || [];
    if (activeTab === "Artists") return searchResults.artists?.results || [];
    if (activeTab === "Albums") return searchResults.albums?.results || [];
    if (activeTab === "Playlists") return searchResults.playlists?.results || [];
    return [];
  };

  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === "Songs") {
      const isCurrentSong = currentSong?.id === item.id;
      const imageUrl = item.image?.[2]?.url || item.image?.[1]?.url || item.image?.[0]?.url;
      const primaryArtists = item.primaryArtists || item.singers || 'Unknown Artist';

      return (
        <TouchableOpacity style={styles.resultItem} onPress={() => handleSongPress(item)}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.itemImageRoundSquare} />
          ) : (
            <View style={[styles.itemImageRoundSquare, { backgroundColor: "#333", justifyContent: "center", alignItems: "center" }]}>
              <Music size={24} color="#666" />
            </View>
          )}
          <View style={styles.itemInfo}>
            <Text style={[styles.itemTitle, { color: isCurrentSong ? "#FF8216" : isDark ? "#FFFFFF" : "#000000" }]} numberOfLines={1}>
              {item.title || item.name}
            </Text>
            <Text style={[styles.itemSubtitle, { color: isDark ? "#9E9E9E" : "#616161" }]} numberOfLines={1}>
              {primaryArtists}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={async (e) => {
              e.stopPropagation();
              if (isCurrentSong) {
                isPlaying ? await pauseSong() : await resumeSong();
              } else {
                let songToPlay = item;
                if (!songToPlay.downloadUrl) {
                  try {
                    songToPlay = await apiService.getSongDetails(item.id);
                  } catch (err) {
                    console.error("Failed to fetch song details", err);
                  }
                }
                await playSong(songToPlay);
              }
            }}
          >
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isCurrentSong && isPlaying ? "#FFE8D6" : "#FF8216", justifyContent: 'center', alignItems: 'center' }}>
              {isCurrentSong && isPlaying ? (
                <Pause size={14} color="#FF8216" fill="#FF8216" />
              ) : (
                <Play size={14} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={(e) => {
              e.stopPropagation();
              setSelectedActionSong(item);
              setActionModalVisible(true);
            }}
          >
            <MoreVertical size={20} color={isDark ? "#9E9E9E" : "#616161"} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }
    else if (activeTab === "Artists") {
      const imageUrl = item.image?.[2]?.url || item.image?.[1]?.url || item.image?.[0]?.url;
      return (
        <TouchableOpacity 
          style={styles.resultItem} 
          onPress={() => navigation.navigate("Artist", {
            id: item.id,
            name: item.title,
            image: typeof imageUrl === 'string' ? imageUrl : '',
            detailText: "1 Album | 20 Songs" // Simulated info until fetched
          })}
        >
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.itemImageCircle} />
          ) : (
            <View style={[styles.itemImageCircle, { backgroundColor: "#333", justifyContent: "center", alignItems: "center" }]}>
              <User size={24} color="#666" />
            </View>
          )}
          <View style={styles.itemInfo}>
            <Text style={[styles.itemTitle, { color: isDark ? "#FFFFFF" : "#000000" }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.itemSubtitle, { color: isDark ? "#9E9E9E" : "#616161" }]} numberOfLines={1}>
              Artist
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    else if (activeTab === "Albums") {
      const imageUrl = item.image?.[2]?.url || item.image?.[1]?.url || item.image?.[0]?.url;
      return (
        <TouchableOpacity 
          style={styles.resultItem}
          onPress={() => navigation.navigate("Album", {
            id: item.id,
            name: item.title,
            image: typeof imageUrl === 'string' ? imageUrl : '',
            detailText: `${item.artist || "Unknown"} | ${item.year || "2023"}`
          })}
        >
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.itemImageRoundSquare} />
          ) : (
            <View style={[styles.itemImageRoundSquare, { backgroundColor: "#333", justifyContent: "center", alignItems: "center" }]}>
              <Disc size={24} color="#666" />
            </View>
          )}
          <View style={styles.itemInfo}>
            <Text style={[styles.itemTitle, { color: isDark ? "#FFFFFF" : "#000000" }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.itemSubtitle, { color: isDark ? "#9E9E9E" : "#616161" }]} numberOfLines={1}>
              {item.artist} | {item.year}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    // Playlists Tab
    else {
      const imageUrl = item.image?.[2]?.url || item.image?.[1]?.url || item.image?.[0]?.url;
      return (
        <TouchableOpacity style={styles.resultItem}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.itemImageRoundSquare} />
          ) : (
            <View style={[styles.itemImageRoundSquare, { backgroundColor: "#333", justifyContent: "center", alignItems: "center" }]}>
              <ListPlus size={24} color="#666" />
            </View>
          )}
          <View style={styles.itemInfo}>
            <Text style={[styles.itemTitle, { color: isDark ? "#FFFFFF" : "#000000" }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.itemSubtitle, { color: isDark ? "#9E9E9E" : "#616161" }]} numberOfLines={1}>
              Playlist
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#FFFFFF" }]}>
        <View style={styles.statusBarPadding} />
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={28} color={isDark ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: isDark ? "#1E1E1E" : "#1E1E1E", borderColor: inputFocused || query.length > 0 ? "#FF8216" : "transparent" },
              (inputFocused || query.length > 0) && styles.searchContainerActive
            ]}
          >
            <Search size={20} color={isDark ? "#9E9E9E" : "#9E9E9E"} />
            <TextInput
              style={[styles.input, { color: isDark ? "#FFFFFF" : "#FFFFFF" }]}
              placeholder="Search..."
              placeholderTextColor={isDark ? "#9E9E9E" : "#9E9E9E"}
              value={query}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onChangeText={(text) => {
                setQuery(text);
                if (text.length === 0) {
                  setHasSearched(false);
                }
              }}
              onSubmitEditing={handleSearchSubmit}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={handleSearchClear} style={{ padding: 5 }}>
                <X size={18} color="#FF8216" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* TABS */}
        {renderTabs()}

        {/* RECENT SEARCHES */}
        {!hasSearched && !loading && (
          <View style={styles.recentContainer}>
            <View style={styles.recentHeader}>
              <Text style={[styles.recentTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}>Recent Searches</Text>
              {recentSearches.length > 0 && (
                <TouchableOpacity onPress={clearAllRecents}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={recentSearches}
              keyExtractor={(item, idx) => `recent-${idx}`}
              renderItem={({ item }) => (
                <View style={styles.recentItemRow}>
                  <TouchableOpacity style={styles.recentTextContainer} onPress={() => navigateToRecent(item)}>
                    <Text style={[styles.recentItemText, { color: isDark ? "#D3D3D3" : "#424242" }]}>{item}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeRecentSearch(item)} style={styles.recentItemClose}>
                    <X size={20} color={isDark ? "#9E9E9E" : "#616161"} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        {/* LOADING */}
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF8216" />
          </View>
        )}

        {/* RESULTS AND EMPTY STATES */}
        {hasSearched && !loading && (
          <View style={styles.resultsContainer}>
            {getActiveArrayLength() === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={getActiveList()}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id || `res-${index}`}
                contentContainerStyle={styles.listContent}
                initialNumToRender={10}
              />
            )}
          </View>
        )}
      </View>

      {/* ACTION MODAL (Reused from Songs) */}
      <Modal visible={actionModalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.actionModalOverlay}
          activeOpacity={1}
          onPress={() => setActionModalVisible(false)}
        >
          <View style={[styles.actionModalContent, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
            <View style={[styles.actionModalDragHandle, { backgroundColor: isDark ? "#444" : "#D3D3D3" }]} />
            
            {selectedActionSong && (
              <View style={styles.actionModalHeader}>
                {selectedActionSong.image?.[2]?.url || selectedActionSong.image?.[1]?.url || selectedActionSong.image?.[0]?.url ? (
                  <Image source={{ uri: selectedActionSong.image?.[2]?.url || selectedActionSong.image?.[1]?.url || selectedActionSong.image?.[0]?.url }} style={styles.actionModalImage} />
                ) : (
                  <View style={[styles.actionModalImage, { backgroundColor: "#333", justifyContent: "center", alignItems: "center" }]}>
                    <Music size={24} color="#666" />
                  </View>
                )}
                <View style={styles.actionModalInfo}>
                  <Text style={[styles.actionModalTitle, { color: isDark ? "#FFFFFF" : "#000000" }]} numberOfLines={1}>
                    {selectedActionSong.name || selectedActionSong.title}
                  </Text>
                  <Text style={[styles.actionModalArtist, { color: isDark ? "#9E9E9E" : "#616161" }]} numberOfLines={1}>
                    {selectedActionSong.primaryArtists || selectedActionSong.singers || 'Unknown Artist'} | 03:50 mins
                  </Text>
                </View>
                <TouchableOpacity>
                  <Heart size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.actionModalDivider, { backgroundColor: isDark ? "#333" : "#F0F0F0" }]} />

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.actionModalItemRow}>
                <ArrowRightCircle size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalItemText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Play Next</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionModalItemRow}>
                <ListPlus size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalItemText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Add to Playing Queue</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionModalItemRow}>
                <PlusCircle size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalItemText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Add to Playlist</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionModalItemRow}>
                <PlayCircle size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalItemText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Go to Album</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionModalItemRow}>
                <User size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalItemText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Go to Artist</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionModalItemRow}>
                <Info size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalItemText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionModalItemRow}>
                <PhoneCall size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalItemText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Set as Ringtone</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionModalItemRow}>
                <XCircle size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalItemText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Add to Blacklist</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionModalItemRow}>
                <Send size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalItemText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionModalItemRow}>
                <Trash2 size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalItemText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Delete from Device</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarPadding: {
    height: Platform.OS === "android" ? Constants.statusBarHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
  },
  searchContainerActive: {
    borderColor: "#FF8216",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // TABS
  tabContainer: {
    height: 50,
    marginVertical: 5,
  },
  tabScrollContent: {
    paddingHorizontal: 15,
    alignItems: "center",
    gap: 10,
  },
  tabPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
  },
  tabPillActive: {
    backgroundColor: "#FF8216",
    borderColor: "#FF8216",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#FFFFFF", // Forced white when active
  },

  // RECENT SEARCHES
  recentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  clearAllText: {
    color: "#FF8216",
    fontSize: 14,
    fontWeight: "600",
  },
  recentItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  recentTextContainer: {
    flex: 1,
  },
  recentItemText: {
    fontSize: 16,
  },
  recentItemClose: {
    paddingLeft: 15,
  },

  // EMPTY STATE
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  // RESULTS
  resultsContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  itemImageRoundSquare: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  itemImageCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
  },
  actionIconButton: {
    padding: 8,
  },
  moreButton: {
    padding: 8,
  },

  // MODAL
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionModalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  actionModalDragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  actionModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionModalImage: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  actionModalInfo: {
    flex: 1,
    marginLeft: 15,
  },
  actionModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionModalArtist: {
    fontSize: 13,
  },
  actionModalDivider: {
    height: 1,
    width: '100%',
    marginBottom: 10,
  },
  actionModalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  actionModalItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 15,
  },
});
