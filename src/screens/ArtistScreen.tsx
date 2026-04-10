import { useMusic } from "@/context/MusicContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { apiService } from "@/services/api";
import { useNavigation, useRoute } from "@react-navigation/native";
import { 
  ArrowLeft, ArrowRightCircle, Heart, Info, ListPlus, 
  MoreHorizontal, MoreVertical, Music, Pause, PhoneCall, 
  Play, PlayCircle, PlusCircle, Search, Send, Shuffle, Trash2, User, XCircle 
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ArtistScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { playSong, currentSong, isPlaying, pauseSong, resumeSong, addToQueue, playMultiple } = useMusic();

  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedActionSong, setSelectedActionSong] = useState<any>(null);

  const params = route.params || {};
  const { id, name, image, detailText } = params as { id: string; name: string; image: string; detailText: string };

  useEffect(() => {
    fetchSongs(0);
  }, [id]);

  const fetchSongs = async (pageNumber: number) => {
    if (pageNumber === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      const results = await apiService.getArtistSongs(id, pageNumber, 10);
      if (results && results.length > 0) {
        if (pageNumber === 0) {
          setSongs(results);
        } else {
          setSongs((prev) => [...prev, ...results]);
        }
        setPage(pageNumber);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (pageNumber === 0) setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchSongs(page + 1);
    }
  }, [loadingMore, hasMore, loading, page]);

  const handleSongPress = useCallback(async (item: any) => {
    if (currentSong?.id === item.id) {
      navigation.navigate("Player");
    } else {
      await playSong(item);
      navigation.navigate("Player");
    }
  }, [currentSong?.id, playSong, navigation]);

  const handlePlayButtonPress = async (e: any, item: any) => {
    e.stopPropagation();
    const isCurrentSong = currentSong?.id === item.id;
    if (isCurrentSong) {
      isPlaying ? await pauseSong() : await resumeSong();
    } else {
      await playSong(item);
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    const isCurrentSong = currentSong?.id === item.id;
    const imageUrl = item.image?.[2]?.url || item.image?.[1]?.url || item.image?.[0]?.url;
    const primaryArtists = item.artists?.primary?.map((a: any) => a.name).join(', ') || item.primaryArtists || 'Unknown Artist';

    return (
      <TouchableOpacity style={styles.songItem} onPress={() => handleSongPress(item)}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.songImage} />
        ) : (
          <View style={[styles.songImage, { backgroundColor: "#333", justifyContent: "center", alignItems: "center" }]}>
            <Music size={24} color="#666" />
          </View>
        )}
        <View style={styles.songInfo}>
          <Text
            style={[styles.songTitle, { color: isCurrentSong ? "#FF8216" : isDark ? "#FFFFFF" : "#000000" }]}
            numberOfLines={1}
          >
            {item.name || item.title}
          </Text>
          <Text style={[styles.songArtist, { color: isDark ? "#9E9E9E" : "#616161" }]} numberOfLines={1}>
            {primaryArtists}
          </Text>
        </View>
        <TouchableOpacity style={styles.playIconButton} onPress={(e) => handlePlayButtonPress(e, item)}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: isCurrentSong && isPlaying ? "#FFE8D6" : "#FF8216",
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {isCurrentSong && isPlaying ? (
              <Pause size={14} color="#FF8216" fill="#FF8216" />
            ) : (
              <Play size={14} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.moreButtonList}
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
  }, [currentSong?.id, isPlaying, isDark, handleSongPress]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#FF8216" />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.artistProfileSection}>
        {image ? (
          <Image source={{ uri: image }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: "#333", justifyContent: "center", alignItems: "center" }]}>
            <User size={60} color="#666" />
          </View>
        )}

        <Text style={[styles.heroName, { color: isDark ? "#FFFFFF" : "#000000" }]}>{name}</Text>
        <Text style={[styles.heroDetails, { color: isDark ? "#A0A0A0" : "#616161" }]}>{detailText}</Text>

        <View style={styles.heroActionButtons}>
          <TouchableOpacity 
            style={styles.shuffleButton}
            onPress={() => {
              if (songs.length > 0) {
                const shuffled = [...songs].sort(() => Math.random() - 0.5);
                playMultiple(shuffled);
              }
            }}
          >
            <Shuffle size={20} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.shuffleButtonText}>Shuffle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playMainButton, { backgroundColor: isDark ? "#2A2A2A" : "#FFF3E0" }]}
            onPress={() => {
              if (songs.length > 0) playMultiple(songs);
            }}
          >
            <Play size={20} color="#FF8216" fill="#FF8216" />
            <Text style={styles.playMainButtonText}>Play</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionTitleRow}>
        <Text style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}>Songs</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#121212" : "#FFFFFF" }]}>

        {/* NAVBAR */}
        <View style={styles.navHeader}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={28} color={isDark ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
          <View style={styles.navRight}>
            <TouchableOpacity style={[styles.navIconBorder, { borderColor: isDark ? "#444" : "#E0E0E0" }]}>
              <Search size={22} color={isDark ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navIconBorder, { borderColor: isDark ? "#444" : "#E0E0E0" }]}>
              <MoreHorizontal size={22} color={isDark ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
          </View>
        </View>

        {loading && page === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF8216" />
          </View>
        ) : (
          <FlatList
            data={songs}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.listContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
          />
        )}
      </SafeAreaView>

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
                    {selectedActionSong.artists?.primary?.map((a: any) => a.name).join(', ') || selectedActionSong.primaryArtists || 'Unknown Artist'} | 03:50 mins
                  </Text>
                </View>
                <TouchableOpacity>
                  <Heart size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.actionModalDivider, { backgroundColor: isDark ? "#333" : "#F0F0F0" }]} />

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.actionModalItem}>
                <ArrowRightCircle size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Play Next</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionModalItem}
                onPress={() => {
                  if (selectedActionSong) addToQueue(selectedActionSong);
                  setActionModalVisible(false);
                }}
              >
                <ListPlus size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Add to Playing Queue</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <PlusCircle size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Add to Playlist</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <PlayCircle size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Go to Album</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <User size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Go to Artist</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <Info size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Details</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <PhoneCall size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Set as Ringtone</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <XCircle size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Add to Blacklist</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <Send size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <Trash2 size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.actionModalText, { color: isDark ? "#FFFFFF" : "#000000" }]}>Delete from Device</Text>
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
  navHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navRight: {
    flexDirection: "row",
    gap: 12,
  },
  navButton: {
    padding: 5,
  },
  navIconBorder: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 100,
  },
  listHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  artistProfileSection: {
    alignItems: "center",
    width: '100%',
    paddingVertical: 20,
  },
  heroImage: {
    width: 280,
    height: 280,
    borderRadius: 45,
    marginBottom: 20,
  },
  heroName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  heroDetails: {
    fontSize: 14,
    marginBottom: 25,
  },
  heroActionButtons: {
    flexDirection: "row",
    gap: 15,
    width: "100%",
  },
  shuffleButton: {
    flex: 1,
    backgroundColor: "#FF8216",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 30,
    gap: 8,
  },
  shuffleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  playMainButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 30,
    gap: 8,
  },
  playMainButtonText: {
    color: "#FF8216",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
    paddingTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  seeAllText: {
    color: "#FF8216",
    fontSize: 16,
    fontWeight: "500",
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  songImage: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
  },
  playIconButton: {
    padding: 8,
  },
  moreButtonList: {
    padding: 8,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
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
  actionModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  actionModalText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 15,
  },
});