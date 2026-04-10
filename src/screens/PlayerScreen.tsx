import { useMusic } from "@/context/MusicContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import Constants from "expo-constants";
import {
    Cast,
    ChevronDown,
    Gauge,
    MoreVertical,
    Pause,
    Play,
    Repeat,
    RotateCcw,
    RotateCw,
    SkipBack,
    SkipForward,
    Timer,
    Music,
    ListMusic,
} from "lucide-react-native";
import {
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function PlayerScreen() {
  const {
    currentSong,
    isPlaying,
    pauseSong,
    resumeSong,
    playbackStatus,
    seekTo,
    playNext,
    playPrevious,
    isRepeatMode,
    toggleRepeatMode,
  } = useMusic();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation<any>();

  if (!currentSong) return null;

  const imageUrl = currentSong.image?.[currentSong.image.length - 1]?.url || 
                   currentSong.image?.[0]?.url ||
                   currentSong.image?.[currentSong.image.length - 1]?.link || 
                   currentSong.image?.[0]?.link;

  const primaryArtists = currentSong.artists?.primary?.map((a: any) => a.name).join(', ') || currentSong.primaryArtists || 'Unknown Artist';

  const position = playbackStatus?.positionMillis || 0;
  const duration = playbackStatus?.durationMillis || 1;

  const formatTime = (millis: number) => {
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronDown size={28} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <TouchableOpacity>
          <MoreVertical size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
      </View>

      <View style={styles.albumArtContainer}>
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
            <Music size={100} color="#666" />
          </View>
        )}
      </View>

      <View style={styles.songInfo}>
        <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#000000" }]}>
          {currentSong.name}
        </Text>
        <Text
          style={[styles.artist, { color: isDark ? "#9E9E9E" : "#616161" }]}
        >
          {primaryArtists}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={seekTo}
          minimumTrackTintColor="#FF8216"
          maximumTrackTintColor={isDark ? "#333333" : "#E0E0E0"}
          thumbTintColor="#FF8216"
        />
        <View style={styles.timeRow}>
          <Text
            style={[styles.timeText, { color: isDark ? "#9E9E9E" : "#616161" }]}
          >
            {formatTime(position)}
          </Text>
          <Text
            style={[styles.timeText, { color: isDark ? "#9E9E9E" : "#616161" }]}
          >
            {formatTime(duration)}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={playPrevious}>
          <SkipBack
            size={32}
            color={isDark ? "#FFFFFF" : "#000000"}
            fill={isDark ? "#FFFFFF" : "#000000"}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <RotateCcw size={28} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={isPlaying ? pauseSong : resumeSong}
        >
          {isPlaying ? (
            <Pause size={36} color="#FFFFFF" fill="#FFFFFF" />
          ) : (
            <Play size={36} color="#FFFFFF" fill="#FFFFFF" />
          )}
        </TouchableOpacity>
        <TouchableOpacity>
          <RotateCw size={28} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={playNext}>
          <SkipForward
            size={32}
            color={isDark ? "#FFFFFF" : "#000000"}
            fill={isDark ? "#FFFFFF" : "#000000"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomActions}>
        <TouchableOpacity>
          <Gauge size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Timer size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleRepeatMode}>
          <Repeat size={24} color={isRepeatMode ? "#FF8216" : isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Queue")}>
          <ListMusic size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <TouchableOpacity>
          <MoreVertical size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.lyricsButton}>
        <ChevronDown
          size={24}
          color={isDark ? "#FFFFFF" : "#000000"}
          style={{ transform: [{ rotate: "180deg" }] }}
        />
        <Text
          style={[styles.lyricsText, { color: isDark ? "#FFFFFF" : "#000000" }]}
        >
          Lyrics
        </Text>
      </TouchableOpacity>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  albumArtContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  albumArt: {
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: 30,
  },
  songInfo: {
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  artist: {
    fontSize: 18,
    marginTop: 10,
    textAlign: "center",
  },
  progressContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  timeText: {
    fontSize: 14,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    marginTop: 20,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF8216",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  lyricsButton: {
    alignItems: "center",
    marginTop: 30,
  },
  lyricsText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
});
