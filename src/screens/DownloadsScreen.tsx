import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMusic } from '@/context/MusicContext';
import { useDownloads } from '@/context/DownloadContext';
import { Music, Play, Pause, Trash2, ArrowDownCircle } from 'lucide-react-native';
import Constants from 'expo-constants';

export default function DownloadsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { playMultiple, currentSong, isPlaying, pauseSong, resumeSong } = useMusic();
  const { downloadedSongs, deleteDownload } = useDownloads();

  const handlePlayButtonPress = async (e: any, item: any, index: number) => {
    e.stopPropagation();
    const isCurrentSong = currentSong?.id === item.id;
    if (isCurrentSong) {
      isPlaying ? await pauseSong() : await resumeSong();
    } else {
      await playMultiple(downloadedSongs, index);
    }
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const isCurrentSong = currentSong?.id === item.id;
    const imageUrl = item.image?.[2]?.url || item.image?.[1]?.url || item.image?.[0]?.url;
    const primaryArtists = item.artists?.primary?.map((a: any) => a.name).join(', ') || item.primaryArtists || 'Unknown Artist';

    return (
      <TouchableOpacity 
        style={styles.songItem} 
        onPress={() => playMultiple(downloadedSongs, index)}
      >
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
        
        <TouchableOpacity style={styles.playIconButton} onPress={(e) => handlePlayButtonPress(e, item, index)}>
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
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            deleteDownload(item.id);
          }}
        >
          <Trash2 size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#FFFFFF" }]}>
      <View style={styles.statusBarPadding} />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}>Downloads</Text>
        <Text style={[styles.subtitle, { color: isDark ? "#9E9E9E" : "#616161" }]}>
          {downloadedSongs.length} offline tracks
        </Text>
      </View>

      {downloadedSongs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ArrowDownCircle size={64} color={isDark ? "#444" : "#E0E0E0"} />
          <Text style={[styles.emptyText, { color: isDark ? "#9E9E9E" : "#616161" }]}>
            No downloaded songs yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={downloadedSongs}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarPadding: {
    height: Platform.OS === 'android' ? Constants.statusBarHeight : 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 10,
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
  playIconButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "500",
  }
});
