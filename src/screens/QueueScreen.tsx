import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMusicStore } from '@/store/useMusicStore';
import { ChevronDown, GripVertical, Trash2, Music } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function QueueScreen() {
  const { queue, queueIndex, currentSong, reorderQueue, removeFromQueue, playSong } = useMusicStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation<any>();

  // Only show upcoming songs in the draggable list
  const upcomingSongs = queue.slice(queueIndex + 1);

  const handleDragEnd = ({ data }: { data: any[] }) => {
    // Reconstruct the full queue
    const pastSongs = queue.slice(0, queueIndex + 1);
    const newQueue = [...pastSongs, ...data];
    reorderQueue(newQueue);
  };

  const handleDelete = (id: string) => {
    const originalIndex = queue.findIndex(s => s.id === id);
    if (originalIndex !== -1) {
      removeFromQueue(originalIndex);
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<any>) => {
    const imageUrl = item.image?.[0]?.url || item.image?.[0]?.link;
    const primaryArtists = item.artists?.primary?.map((a: any) => a.name).join(', ') || item.primaryArtists || 'Unknown Artist';

    return (
      <ScaleDecorator>
        <View style={[styles.songItem, isActive && { backgroundColor: isDark ? '#333' : '#E0E0E0' }]}>
          <TouchableOpacity 
            style={styles.songInfoContainer}
            onPress={() => {
               // If tapped, play this song from the queue logically
               const origIdx = queue.findIndex(s => s.id === item.id);
               // the user would manually trigger it - skip to it?
               // The assignment states Add, Reorder, Remove. For now, we'll just allow display/remove
            }}
          >
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.albumArt} />
            ) : (
              <View style={[styles.albumArt, styles.fallbackArt]}>
                <Music size={24} color="#666" />
              </View>
            )}
            <View style={styles.songTextContainer}>
              <Text style={[styles.songTitle, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.songArtist, { color: isDark ? '#9E9E9E' : '#616161' }]} numberOfLines={1}>
                {primaryArtists}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.actionContainer}>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
              <Trash2 size={20} color="#FF6B6B" />
            </TouchableOpacity>
            <TouchableOpacity onLongPress={drag} style={styles.dragButton}>
              <GripVertical size={24} color={isDark ? '#9E9E9E' : '#616161'} />
            </TouchableOpacity>
          </View>
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
        <View style={styles.statusBarPadding} />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <ChevronDown size={28} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Now Playing</Text>
          <View style={styles.headerBtn} />
        </View>

        {currentSong && (
          <View style={[styles.currentSongContainer, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: '#FF8216' }]}>Currently Playing</Text>
            <View style={styles.currentSongInfo}>
              <Image 
                source={{ uri: currentSong.image?.[currentSong.image.length-1]?.url || currentSong.image?.[0]?.url }} 
                style={styles.currentAlbumArt} 
              />
              <View style={styles.currentSongText}>
                <Text style={[styles.currentTitle, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={2}>
                  {currentSong.name}
                </Text>
                <Text style={[styles.currentArtist, { color: isDark ? '#9E9E9E' : '#616161' }]} numberOfLines={1}>
                  {currentSong.artists?.primary?.map((a: any) => a.name).join(', ') || currentSong.primaryArtists}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.queueContainer}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000', marginBottom: 15 }]}>
            Up Next ({upcomingSongs.length})
          </Text>
          
          {upcomingSongs.length > 0 ? (
            <DraggableFlatList
              data={upcomingSongs}
              onDragEnd={handleDragEnd}
              keyExtractor={(item, index) => item.id + '-' + index}
              renderItem={renderItem}
              containerStyle={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: isDark ? '#9E9E9E' : '#616161' }]}>
                No upcoming songs. Add some to the queue!
              </Text>
            </View>
          )}
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBarPadding: { height: Platform.OS === 'android' ? Constants.statusBarHeight : 0 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  currentSongContainer: {
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  currentSongInfo: { flexDirection: 'row', alignItems: 'center' },
  currentAlbumArt: { width: 60, height: 60, borderRadius: 10 },
  currentSongText: { flex: 1, marginLeft: 15 },
  currentTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  currentArtist: { fontSize: 14 },
  queueContainer: { flex: 1, paddingHorizontal: 20 },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  songInfoContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  albumArt: { width: 50, height: 50, borderRadius: 8 },
  fallbackArt: { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  songTextContainer: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  songTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  songArtist: { fontSize: 14 },
  actionContainer: { flexDirection: 'row', alignItems: 'center' },
  deleteButton: { padding: 10 },
  dragButton: { padding: 10 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, fontStyle: 'italic' }
});
