import { useColorScheme } from "@/hooks/use-color-scheme";
import { apiService } from "@/services/api";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowRightCircle,
  ListPlus,
  MoreVertical,
  PlayCircle,
  PlusCircle,
  Send,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
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

export default function HomeArtists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation<any>();

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedActionArtist, setSelectedActionArtist] = useState<any>(null);

  // Dynamic colors based on theme
  const modalBg = isDark ? "#1A1A1A" : "#FFFFFF";
  const modalText = isDark ? "#FFFFFF" : "#000000";
  const modalSubText = isDark ? "#9E9E9E" : "#616161";
  const modalDivider = isDark ? "#2A2A2A" : "#F0F0F0";
  const modalDragHandle = isDark ? "#444444" : "#D3D3D3";

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const results = await apiService.searchArtists("a");
      
      const detailedArtistsPromises = results.map(async (artist: any) => {
        try {
          const counts = await apiService.getArtistCounts(artist.id);
          return { ...artist, aCount: counts.albums, sCount: counts.songs };
        } catch (e) {
          return { ...artist, aCount: 0, sCount: 0 };
        }
      });
      
      const detailedArtists = await Promise.all(detailedArtistsPromises);
      const filtered = detailedArtists.filter((a: any) => a.aCount > 0 || a.sCount > 0);
      
      setArtists(filtered as any);
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
      <TouchableOpacity 
        style={styles.artistItem}
        onPress={() => navigation.navigate("Artist", {
          id: item.id,
          name: item.title || item.name,
          image: typeof imageUrl === 'string' ? imageUrl : '',
          detailText: [
            item.aCount > 0 ? `${item.aCount} Album${item.aCount > 1 ? 's' : ''}` : null,
            item.sCount > 0 ? `${item.sCount} Song${item.sCount > 1 ? 's' : ''}` : null
          ].filter(Boolean).join(' | ')
        })}
      >
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
            {[
              item.aCount > 0 ? `${item.aCount} Album${item.aCount > 1 ? 's' : ''}` : null,
              item.sCount > 0 ? `${item.sCount} Song${item.sCount > 1 ? 's' : ''}` : null
            ].filter(Boolean).join(' | ') || (item.role ? item.role.charAt(0).toUpperCase() + item.role.slice(1) : "Artist")}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={(e) => {
            e.stopPropagation();
            setSelectedActionArtist(item);
            setActionModalVisible(true);
          }}
        >
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

      {/* Action Bottom Sheet Modal */}
      <Modal visible={actionModalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.actionModalOverlay}
          activeOpacity={1}
          onPress={() => setActionModalVisible(false)}
        >
          <View style={[styles.actionModalContent, { backgroundColor: modalBg }]}>
            <View style={[styles.actionModalDragHandle, { backgroundColor: modalDragHandle }]} />

            {selectedActionArtist && (
              <View style={styles.actionModalHeader}>
                {selectedActionArtist.image?.[2]?.url || selectedActionArtist.image?.[1]?.url || selectedActionArtist.image?.[0]?.url || typeof selectedActionArtist.image === 'string' ? (
                  <Image
                    source={{ uri: selectedActionArtist.image?.[2]?.url || selectedActionArtist.image?.[1]?.url || selectedActionArtist.image?.[0]?.url || selectedActionArtist.image }}
                    style={styles.actionModalImage}
                  />
                ) : (
                  <View style={[styles.actionModalImage, { backgroundColor: "#333", justifyContent: "center", alignItems: "center" }]}>
                    <User size={30} color="#666" />
                  </View>
                )}
                <View style={styles.actionModalInfo}>
                  <Text style={[styles.actionModalTitle, { color: modalText }]} numberOfLines={1}>
                    {selectedActionArtist.name || selectedActionArtist.title || "Unknown Artist"}
                  </Text>
                  <Text style={[styles.actionModalArtist, { color: modalSubText }]} numberOfLines={1}>
                    {[
                      selectedActionArtist.aCount > 0 ? `${selectedActionArtist.aCount} Album${selectedActionArtist.aCount > 1 ? 's' : ''}` : null,
                      selectedActionArtist.sCount > 0 ? `${selectedActionArtist.sCount} Song${selectedActionArtist.sCount > 1 ? 's' : ''}` : null
                    ].filter(Boolean).join(' | ') || "Artist"}
                  </Text>
                </View>
              </View>
            )}

            <View style={[styles.actionModalDivider, { backgroundColor: modalDivider }]} />

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.actionModalItem}>
                <PlayCircle size={24} color={modalText} />
                <Text style={[styles.actionModalText, { color: modalText }]}>Play</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <ArrowRightCircle size={24} color={modalText} />
                <Text style={[styles.actionModalText, { color: modalText }]}>Play Next</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <ListPlus size={24} color={modalText} />
                <Text style={[styles.actionModalText, { color: modalText }]}>Add to Playing Queue</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <PlusCircle size={24} color={modalText} />
                <Text style={[styles.actionModalText, { color: modalText }]}>Add to Playlist</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <Send size={24} color={modalText} />
                <Text style={[styles.actionModalText, { color: modalText }]}>Share</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 140,
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
    borderRadius: 30, // Fully circular for artists
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
