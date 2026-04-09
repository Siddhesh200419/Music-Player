import { useColorScheme } from "@/hooks/use-color-scheme";
import { apiService } from "@/services/api";
import { useNavigation } from "@react-navigation/native";
import { Disc, MoreVertical } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 60) / 2; // 20 padding on sides, 20 gap between columns

export default function HomeAlbums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const results = await apiService.searchAlbums("latest");
      setAlbums(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const imageUrl =
      item.image?.[2]?.url || item.image?.[1]?.url || item.image?.[0]?.url;

    return (
      <TouchableOpacity 
        style={styles.albumItem}
        onPress={() => {
          navigation.navigate("Album", {
            id: item.id || item.title || item.name,
            name: item.title || item.name,
            image: typeof imageUrl === 'string' ? imageUrl : '',
            detailText: `${item.music || item.primaryArtists || "Unknown"} | ${item.year || "2023"}`
          });
        }}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.albumImage} />
        ) : (
          <View
            style={[
              styles.albumImage,
              {
                backgroundColor: "#333",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Disc size={40} color="#666" />
          </View>
        )}
        <View style={styles.albumInfoContainer}>
          <View style={styles.albumInfo}>
            <Text
              style={[
                styles.albumName,
                { color: isDark ? "#FFFFFF" : "#000000" },
              ]}
              numberOfLines={1}
            >
              {item.title || item.name}
            </Text>
            <Text
              style={[
                styles.albumDetails,
                { color: isDark ? "#9E9E9E" : "#616161" },
              ]}
              numberOfLines={1}
            >
              {item.music || item.primaryArtists || "Unknown"} |{" "}
              {item.year || "2023"}
            </Text>
            <Text
              style={[
                styles.albumSongs,
                { color: isDark ? "#9E9E9E" : "#616161" },
              ]}
              numberOfLines={1}
            >
              Album
            </Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <MoreVertical size={18} color={isDark ? "#9E9E9E" : "#616161"} />
          </TouchableOpacity>
        </View>
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
          {albums.length} albums
        </Text>
        <TouchableOpacity>
          <Text style={styles.sortText}>Date Modified ⇅</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={albums}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
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
  columnWrapper: {
    justifyContent: "space-between",
  },
  albumItem: {
    width: COLUMN_WIDTH,
    marginBottom: 25,
  },
  albumImage: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH,
    borderRadius: 25, // Rounded corners for albums
    marginBottom: 10,
  },
  albumInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  albumInfo: {
    flex: 1,
    paddingRight: 5,
  },
  albumName: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  albumDetails: {
    fontSize: 12,
    marginBottom: 2,
  },
  albumSongs: {
    fontSize: 12,
  },
  moreButton: {
    padding: 2,
  },
});
