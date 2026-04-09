import { useMusic } from "@/context/MusicContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { apiService } from "@/services/api";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { ChevronLeft, Music, Pause, Play, Search } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { playSong, currentSong, isPlaying, pauseSong, resumeSong } =
    useMusic();
  const router = useRouter();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await apiService.searchSongs(query);
      setResults(data);
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
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#FFFFFF" },
      ]}
    >
      <View style={styles.statusBarPadding} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={28} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: isDark ? "#1E1E1E" : "#F5F5F5" },
          ]}
        >
          <Search size={20} color={isDark ? "#9E9E9E" : "#616161"} />
          <TextInput
            style={[styles.input, { color: isDark ? "#FFFFFF" : "#000000" }]}
            placeholder="Search songs, artists..."
            placeholderTextColor={isDark ? "#9E9E9E" : "#616161"}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            autoFocus
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF8216" />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : query && !loading ? (
        <View style={styles.center}>
          <Text
            style={[styles.noResult, { color: isDark ? "#9E9E9E" : "#616161" }]}
          >
            No results found
          </Text>
        </View>
      ) : null}
    </View>
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
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
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
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  songArtist: {
    fontSize: 14,
    marginTop: 2,
  },
  playButton: {
    padding: 8,
  },
  noResult: {
    fontSize: 16,
  },
});
