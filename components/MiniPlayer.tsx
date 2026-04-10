import { useMusicStore } from "@/store/useMusicStore";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNavigation } from "@react-navigation/native";
import { Music, Pause, Play, SkipForward } from "lucide-react-native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MiniPlayer({ currentRouteName }: { currentRouteName?: string }) {
  const { currentSong, isPlaying, pauseSong, resumeSong, playbackStatus } = useMusicStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation<any>();

  const isTabBarScreen = currentRouteName ? ["Home", "Suggested", "Songs", "Artists", "Albums", "Favorites", "Playlists", "Settings"].includes(currentRouteName) : false;
  // Make it float slightly above the tab bar like Spotify
  const bottomPosition = isTabBarScreen ? 68 : 8;

  // Don't show MiniPlayer on the full player screen
  if (!currentSong || currentRouteName === "Player") return null;

  const imageUrl = currentSong.image?.[0]?.url || currentSong.image?.[0]?.link;
  const primaryArtists =
    currentSong.artists?.primary?.map((a: any) => a.name).join(", ") ||
    currentSong.primaryArtists ||
    "Unknown Artist";

  const position = playbackStatus?.positionMillis || 0;
  const duration = playbackStatus?.durationMillis || 1;
  const progressPercent = (position / duration) * 100;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: isDark ? "#2C2C2C" : "#F5F5F5", // Slightly distinct dark color for the floating player matching Spotify contrast
          bottom: bottomPosition 
        },
      ]}
      onPress={() => navigation.navigate("Player")}
      activeOpacity={0.9}
    >
      <View style={styles.progressContainer}>
        <View style={[styles.progressLine, { width: `${progressPercent}%` }]} />
      </View>

      <View style={styles.content}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.albumArt} />
        ) : (
          <View
            style={[
              styles.albumArt,
              {
                backgroundColor: "#333",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Music size={20} color="#666" />
          </View>
        )}

        <View style={styles.songInfo}>
          <Text
            style={[styles.title, { color: isDark ? "#FFFFFF" : "#000000" }]}
            numberOfLines={1}
          >
            {currentSong.name}
          </Text>
          <Text
            style={[styles.artist, { color: isDark ? "#B3B3B3" : "#616161" }]}
            numberOfLines={1}
          >
            {primaryArtists}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={(e) => {
              e.stopPropagation();
              isPlaying ? pauseSong() : resumeSong();
            }}
          >
            {isPlaying ? (
              <Pause size={24} color={isDark ? "#FFFFFF" : "#000000"} fill={isDark ? "#FFFFFF" : "#000000"} />
            ) : (
              <Play size={24} color={isDark ? "#FFFFFF" : "#000000"} fill={isDark ? "#FFFFFF" : "#000000"} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 8,
    right: 8,
    height: 56,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  progressContainer: {
    height: 3,
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Faint background track
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  progressLine: {
    height: "100%",
    backgroundColor: "#FF8216", // distinct orange
    zIndex: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    height: "100%",
  },
  albumArt: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  artist: {
    fontSize: 14,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButton: {
    padding: 10,
  },
  skipButton: {
    padding: 10,
  },
});
