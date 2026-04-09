import { useColorScheme } from "@/hooks/use-color-scheme";
import { apiService } from "@/services/api";
import { MoreVertical, User } from "lucide-react-native";
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

export default function HomeArtists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const results = await apiService.searchArtists("a");
      setArtists(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    // Some endpoints return image array, some return a single string or different format
    // So let's add multiple fallbacks
    const imageUrl =
      item.image?.[2]?.url || item.image?.[1]?.url || item.image?.[0]?.url || item.image;

    // Use name or title, with a strong fallback
    const displayName = item.name || item.title || "Unknown Artist";

    return (
      <TouchableOpacity style={styles.artistItem}>
        {imageUrl && typeof imageUrl === 'string' ? (
          <Image source={{ uri: imageUrl }} style={styles.artistImage} />
        ) : (
          <View
            style={[
              styles.artistImage,
              {
                backgroundColor: "#333",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <User size={30} color="#666" />
          </View>
        )}
        <View style={styles.artistInfo}>
          <Text
            style={[
              styles.artistName,
              { color: isDark ? "#FFFFFF" : "#000000" },
            ]}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Text
            style={[
              styles.artistDetails,
              { color: isDark ? "#9E9E9E" : "#616161" },
            ]}
            numberOfLines={1}
          >
            {item.role ? item.role.charAt(0).toUpperCase() + item.role.slice(1) : "Artist"}
          </Text>
        </View>
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
          {artists.length} artists
        </Text>
        <TouchableOpacity>
          <Text style={styles.sortText}>Date Added ⇅</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={artists}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || index.toString()}
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
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  artistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  artistImage: {
    width: 70,
    height: 70,
    borderRadius: 35, // Fully circular
  },
  artistInfo: {
    flex: 1,
    marginLeft: 15,
  },
  artistName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  artistDetails: {
    fontSize: 13,
  },
  moreButton: {
    padding: 8,
  },
});
