import { useMusic } from "@/context/MusicContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { apiService } from "@/services/api";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowRightCircle,
  Heart,
  Info,
  ListPlus,
  MoreVertical, Music, Pause,
  PhoneCall,
  Play,
  PlayCircle,
  PlusCircle,
  Send, Trash2,
  User,
  XCircle
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

export default function HomeSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { playSong, currentSong, isPlaying, pauseSong, resumeSong, addToQueue } =
    useMusic();
  const navigation = useNavigation<any>();

  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Ascending");

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedActionSong, setSelectedActionSong] = useState<any>(null);

  const sortOptions = [
    "Ascending",
    "Descending",
    "Artist",
    "Album",
    "Year",
    "Date Added",
    "Date Modified",
    "Composer",
  ];

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
      navigation.navigate("Player");
    } else {
      await playSong(item);
      navigation.navigate("Player");
    }
  };

  // Dynamic colors based on theme
  const modalBg = isDark ? "#1A1A1A" : "#FFFFFF";
  const modalText = isDark ? "#FFFFFF" : "#000000";
  const modalSubText = isDark ? "#9E9E9E" : "#616161";
  const modalDivider = isDark ? "#2A2A2A" : "#F0F0F0";
  const modalDragHandle = isDark ? "#444444" : "#D3D3D3";

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
          style={styles.moreButton}
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
        <TouchableOpacity onPress={() => setSortModalVisible(true)}>
          <Text style={styles.sortText}>{selectedSort} ⇅</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={songs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      {/* Sort Modal */}
      <Modal visible={isSortModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View style={[styles.dropdownMenu, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
            {sortOptions.map((option, index) => (
              <View key={option}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedSort(option);
                    setSortModalVisible(false);
                  }}
                >
                  <Text style={[styles.dropdownText, { color: isDark ? "#FFFFFF" : "#000000" }]}>
                    {option}
                  </Text>
                  <View style={[styles.radioButton, selectedSort === option && styles.radioButtonSelected]}>
                    {selectedSort === option && <View style={styles.radioButtonInner} />}
                  </View>
                </TouchableOpacity>
                {index < sortOptions.length - 1 && (
                  <View style={[styles.dropdownDivider, { backgroundColor: isDark ? "#333333" : "#F0F0F0" }]} />
                )}
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Action Bottom Sheet Modal */}
      <Modal visible={actionModalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.actionModalOverlay}
          activeOpacity={1}
          onPress={() => setActionModalVisible(false)}
        >
          <View style={[styles.actionModalContent, { backgroundColor: modalBg }]}>
            <View style={[styles.actionModalDragHandle, { backgroundColor: modalDragHandle }]} />
            
            {selectedActionSong && (
              <View style={styles.actionModalHeader}>
                {selectedActionSong.image?.[2]?.url || selectedActionSong.image?.[1]?.url || selectedActionSong.image?.[0]?.url ? (
                  <Image
                    source={{ uri: selectedActionSong.image?.[2]?.url || selectedActionSong.image?.[1]?.url || selectedActionSong.image?.[0]?.url }}
                    style={styles.actionModalImage}
                  />
                ) : (
                  <View style={[styles.actionModalImage, { backgroundColor: "#333", justifyContent: "center", alignItems: "center" }]}>
                    <Music size={24} color="#666" />
                  </View>
                )}
                <View style={styles.actionModalInfo}>
                  <Text style={[styles.actionModalTitle, { color: modalText }]} numberOfLines={1}>
                    {selectedActionSong.name}
                  </Text>
                  <Text style={[styles.actionModalArtist, { color: modalSubText }]} numberOfLines={1}>
                    {selectedActionSong.artists?.primary?.map((a: any) => a.name).join(', ') || selectedActionSong.primaryArtists || 'Unknown Artist'} | 03:50 mins
                  </Text>
                </View>
                <TouchableOpacity>
                  <Heart size={24} color={modalText} />
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.actionModalDivider, { backgroundColor: modalDivider }]} />

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.actionModalItem}>
                <ArrowRightCircle size={24} color={modalText} />
                <Text style={[styles.actionModalText, { color: modalText }]}>Play Next</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionModalItem}
                onPress={() => {
                  if (selectedActionSong) addToQueue(selectedActionSong);
                  setActionModalVisible(false);
                }}
              >
                <ListPlus size={24} color={modalText} />
                <Text style={[styles.actionModalText, { color: modalText }]}>Add to Playing Queue</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <PlusCircle size={24} color={modalText} />
                <Text style={[styles.actionModalText, { color: modalText }]}>Add to Playlist</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <PlayCircle size={24} color={modalText} />
                <Text style={[styles.actionModalText, { color: modalText }]}>Go to Album</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <User size={24} color={modalText} />
                <Text style={[styles.actionModalText, { color: modalText }]}>Go to Artist</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <Info size={24} color={modalText} />
                <Text style={[styles.actionModalText, { color: modalText }]}>Details</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <PhoneCall size={24} color={modalText} />
                <Text style={[styles.actionModalText, { color: modalText }]}>Set as Ringtone</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <XCircle size={24} color={modalText} />
                <Text style={[styles.actionModalText, { color: modalText }]}>Add to Blacklist</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <Send size={24} color={modalText} />
                <Text style={[styles.actionModalText, { color: modalText }]}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionModalItem}>
                <Trash2 size={24} color={modalText} />
                <Text style={[styles.actionModalText, { color: modalText }]}>Delete from Device</Text>
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
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 180,
    right: 20,
    width: 200,
    borderRadius: 15,
    paddingVertical: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF8216',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#FF8216',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF8216',
  },
  dropdownDivider: {
    height: 1,
    marginHorizontal: 20,
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