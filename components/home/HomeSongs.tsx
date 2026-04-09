import { useMusic } from "@/context/MusicContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { apiService } from "@/services/api";
import { useRouter } from "expo-router";
import { MoreVertical, Music, Pause, Play } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function HomeSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { playSong, currentSong, isPlaying, pauseSong, resumeSong } =
    useMusic();
  const router = useRouter();

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const results = await apiService.getTrendingSongs();
      setSongs(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSongPress = async (item: any) => {
    if (currentSong?.id === item.id) {
      router.push("/player");
    } else {
      await playSong(item);
      router.push("/player");
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isCurrentSong = currentSong?.id === item.id;
    const imageUrl =
      item.image?.[2]?.url || item.image?.[1]?.url || item.image?.[0]?.url;

    const primaryArtists = item.artists?.primary?.map((a: any) => a.name).join(', ') || item.primaryArtists || 'Unknown Artist';

    return (
      <TouchableOpacity
        style={styles.songItem}
        onPress={() => handleSongPress(item)}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.songImage} />
        ) : (
          <View
            style={[
              styles.songImage,
              {
                backgroundColor: "#333",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Music size={24} color="#666" />
          </View>
        )}
        <View style={styles.songInfo}>
          <Text
            style={[
              styles.songTitle,
              {
                color: isCurrentSong
                  ? "#FF8216"
                  : isDark
                  ? "#FFFFFF"
                  : "#000000",
              },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.songArtist,
              { color: isDark ? "#9E9E9E" : "#616161" },
            ]}
            numberOfLines={1}
          >
            {primaryArtists}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.playButton}
          onPress={async (e) => {
            e.stopPropagation();
            if (isCurrentSong) {
              isPlaying ? await pauseSong() : await resumeSong();
            } else {
              await playSong(item);
            }
          }}
        >
          {isCurrentSong && isPlaying ? (
            <Pause size={20} color="#FF8216" fill="#FF8216" />
          ) : (
            <Play size={20} color="#FF8216" fill="#FF8216" />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={20} color={isDark ? "#9E9E9E" : "#616161"} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8216" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#FFFFFF" },
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[styles.countText, { color: isDark ? "#FFFFFF" : "#000000" }]}
        >
          {songs.length} songs
        </Text>
        <TouchableOpacity>
          <Text style={styles.sortText}>Ascending ⇅</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={songs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  countText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sortText: {
    color: "#FF8216",
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  playButton: {
    padding: 8,
  },
  moreButton: {
    padding: 8,
  },
});
