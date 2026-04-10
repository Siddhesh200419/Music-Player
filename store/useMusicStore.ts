import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Song {
  id: string;
  name: string;
  album: { name: string };
  image: { url: string; link?: string; quality: string }[];
  primaryArtists?: string;
  artists?: { primary: { name: string }[] };
  downloadUrl: { url: string; link?: string; quality: string }[];
  duration: number;
}

interface MusicState {
  sound: Audio.Sound | null;
  currentSong: Song | null;
  isPlaying: boolean;
  playbackStatus: any;
  queue: Song[];
  queueIndex: number;
  isRepeatMode: boolean;
  
  // Actions
  playSong: (song: Song) => Promise<void>;
  playMultiple: (songs: Song[], startIndex?: number) => Promise<void>;
  pauseSong: () => Promise<void>;
  resumeSong: () => Promise<void>;
  stopSong: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  addToQueue: (song: Song) => Promise<void>;
  removeFromQueue: (index: number) => Promise<void>;
  reorderQueue: (newQueue: Song[]) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  clearQueue: () => Promise<void>;
  toggleRepeatMode: () => void;
  initAudioMode: () => Promise<void>;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      sound: null,
      currentSong: null,
      isPlaying: false,
      playbackStatus: null,
      queue: [],
      queueIndex: -1,
      isRepeatMode: false,

      initAudioMode: async () => {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      },

      playSong: async (song: Song) => {
        const state = get();
        try {
          if (state.sound) {
            await state.sound.unloadAsync();
          }

          let audioUrl = "";

          try {
            const offlineRegistryData = await AsyncStorage.getItem('downloadedSongs');
            if (offlineRegistryData) {
              const offlineRegistry = JSON.parse(offlineRegistryData);
              const offlineHit = offlineRegistry.find((s: any) => s.id === song.id);
              if (offlineHit && offlineHit.localUri) {
                audioUrl = offlineHit.localUri;
              }
            }
          } catch(e) {}

          if (!audioUrl) {
            audioUrl =
              song.downloadUrl?.[4]?.url ||
              song.downloadUrl?.[3]?.url ||
              song.downloadUrl?.[2]?.url ||
              song.downloadUrl?.[1]?.url ||
              song.downloadUrl?.[0]?.url ||
              song.downloadUrl?.[4]?.link ||
              song.downloadUrl?.[0]?.link || "";
          }

          if (!audioUrl) return;

          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: audioUrl },
            { shouldPlay: true },
            (status: any) => {
              set({ playbackStatus: status });
              if (status.isLoaded) {
                set({ isPlaying: status.isPlaying });
                if (status.didJustFinish) {
                  set({ isPlaying: false });
                  setTimeout(() => {
                    const freshState = get();
                    if (freshState.isRepeatMode) {
                      freshState.sound?.replayAsync();
                    } else {
                      freshState.playNext();
                    }
                  }, 100);
                }
              }
            }
          );

          set({ sound: newSound, currentSong: song, isPlaying: true });
        } catch (error) {
          console.error("Error playing song:", error);
        }
      },

      playMultiple: async (songs: Song[], startIndex: number = 0) => {
        if (!songs || songs.length === 0) return;
        set({ queue: songs, queueIndex: startIndex });
        await get().playSong(songs[startIndex]);
      },

      playNext: async () => {
        const state = get();
        if (state.queue.length === 0) return;
        const nextIndex = state.queueIndex + 1;
        if (nextIndex < state.queue.length) {
          set({ queueIndex: nextIndex });
          await get().playSong(state.queue[nextIndex]);
        } else {
          set({ isPlaying: false });
        }
      },

      playPrevious: async () => {
        const state = get();
        if (state.queue.length === 0) return;
        const prevIndex = state.queueIndex - 1;
        if (prevIndex >= 0) {
          set({ queueIndex: prevIndex });
          await get().playSong(state.queue[prevIndex]);
        } else {
          if (state.sound) await state.sound.setPositionAsync(0);
        }
      },

      addToQueue: async (song: Song) => {
        const state = get();
        const newQueue = [...state.queue, song];
        if (!state.currentSong) {
          set({ queue: newQueue, queueIndex: 0 });
          await get().playSong(song);
        } else {
          set({ queue: newQueue });
        }
      },

      removeFromQueue: async (index: number) => {
        const state = get();
        const newQueue = [...state.queue];
        newQueue.splice(index, 1);
        let newIndex = state.queueIndex;
        if (index < newIndex) {
          newIndex -= 1;
        }
        set({ queue: newQueue, queueIndex: newIndex });
      },

      reorderQueue: async (newQueue: Song[]) => {
        set({ queue: newQueue });
      },

      clearQueue: async () => {
        set({ queue: [], queueIndex: -1 });
      },

      pauseSong: async () => {
        const state = get();
        if (state.sound) {
          await state.sound.pauseAsync();
          set({ isPlaying: false });
        }
      },

      resumeSong: async () => {
        const state = get();
        if (state.sound) {
          await state.sound.playAsync();
          set({ isPlaying: true });
        }
      },

      stopSong: async () => {
        const state = get();
        if (state.sound) {
          await state.sound.stopAsync();
          set({ isPlaying: false });
        }
      },

      seekTo: async (position: number) => {
        const state = get();
        if (state.sound) {
          await state.sound.setPositionAsync(position);
        }
      },

      toggleRepeatMode: () => {
        set({ isRepeatMode: !get().isRepeatMode });
      }
    }),
    {
      name: 'music-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        queue: state.queue, 
        queueIndex: state.queueIndex, 
        currentSong: state.currentSong, 
        isRepeatMode: state.isRepeatMode 
      }), // Ignore sound refs
    }
  )
);
