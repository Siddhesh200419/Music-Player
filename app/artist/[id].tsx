import { useMusic } from "@/context/MusicContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { apiService } from "@/services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, MoreHorizontal, Play, Search, Shuffle, MoreVertical, Pause, Music, User } from "lucide-react-native";
import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ArtistScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { playSong, currentSong, isPlaying, pauseSong, resumeSong } = useMusic();

  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // Using 0 because getArtistSongs defaults to 0-based
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Extract from params
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
  }, [loadingMore, hasMore, loading, page, fetchSongs]);

  const handleSongPress = useCallback(async (item: any) => {
    if (currentSong?.id === item.id) {
      router.push("/player");
    } else {
      await playSong(item);
      router.push("/player");
    }
  }, [currentSong?.id, playSong, router]);

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
          <Text style={[styles.songTitle, { color: isCurrentSong ? "#FF8216" : isDark ? "#FFFFFF" : "#000000" }]} numberOfLines={1}>
            {item.name || item.title}
          </Text>
          <Text style={[styles.songArtist, { color: isDark ? "#9E9E9E" : "#616161" }]} numberOfLines={1}>
            {primaryArtists}
          </Text>
        </View>
        <TouchableOpacity style={styles.playIconButton} onPress={(e) => handlePlayButtonPress(e, item)}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isCurrentSong && isPlaying ? "#FFE8D6" : "#FF8216", justifyContent: 'center', alignItems: 'center' }}>
             {isCurrentSong && isPlaying ? (
               <Pause size={14} color="#FF8216" fill="#FF8216" />
             ) : (
               <Play size={14} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
             )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButtonList}>
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

  const renderHeader = () => {
    return (
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
            <TouchableOpacity style={styles.shuffleButton}>
              <Shuffle size={20} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.shuffleButtonText}>Shuffle</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.playMainButton, { backgroundColor: isDark ? "#2A2A2A" : "#FFF3E0" }]} onPress={() => {
                if (songs.length > 0) {
                  playSong(songs[0]);
                }
            }}>
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
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#FFFFFF" }]}>
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
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
    </View>
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
    paddingTop: 50,
    paddingBottom: 10,
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
    paddingBottom: 20,
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
});
