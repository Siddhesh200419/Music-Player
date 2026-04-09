import { useMusic } from "@/context/MusicContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNavigation } from "@react-navigation/native";
import { Music, Pause, Play, SkipForward } from "lucide-react-native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MiniPlayer({ currentRouteName }: { currentRouteName?: string }) {
  const { currentSong, isPlaying, pauseSong, resumeSong, playbackStatus } =
    useMusic();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation<any>();

  const isTabBarScreen = currentRouteName ? ["Home", "Favorites", "Playlists", "Settings"].includes(currentRouteName) : false;
  const bottomPosition = isTabBarScreen ? 60 : 0;

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
          backgroundColor: isDark ? "#1E1E1E" : "#F5F5F5",
          bottom: bottomPosition 
        },
      ]}
      onPress={() => navigation.navigate("Player")}
      activeOpacity={0.9}
    >
      <View style={[styles.progressLine, { width: `${progressPercent}%` }]} />

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
            style={[styles.artist, { color: isDark ? "#9E9E9E" : "#616161" }]}
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
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: isPlaying ? "#FFE8D6" : "#FF8216",
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {isPlaying ? (
                <Pause size={14} color="#FF8216" fill="#FF8216" />
              ) : (
                <Play size={14} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={(e) => e.stopPropagation()}
          >
            <SkipForward
              size={24}
              color={isDark ? "#FFFFFF" : "#000000"}
              fill={isDark ? "#FFFFFF" : "#000000"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "#333",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  progressLine: {
    height: 2,
    backgroundColor: "#FF8216",
    position: "absolute",
    top: 0,
    left: 0,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: "100%",
  },
  albumArt: {
    width: 40,
    height: 40,
    borderRadius: 8,
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
