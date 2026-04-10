import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DownloadedSong {
  id: string;
  name: string;
  album: { name: string };
  image: { url: string; link?: string; quality: string }[];
  primaryArtists?: string;
  artists?: { primary: { name: string }[] };
  downloadUrl: { url: string; link?: string; quality: string }[];
  duration: number;
  localUri: string;
}

interface DownloadState {
  downloadedSongs: DownloadedSong[];
  activeDownloads: string[];
  downloadSong: (song: any) => Promise<void>;
  deleteDownload: (id: string) => Promise<void>;
  isDownloaded: (id: string) => boolean;
}

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set, get) => ({
      downloadedSongs: [],
      activeDownloads: [],
      downloadSong: async (song: any) => {
        const state = get();
        if (state.activeDownloads.includes(song.id) || state.isDownloaded(song.id)) return;

        set({ activeDownloads: [...state.activeDownloads, song.id] });

        try {
          const audioUrl =
            song.downloadUrl?.[4]?.url ||
            song.downloadUrl?.[3]?.url ||
            song.downloadUrl?.[2]?.url ||
            song.downloadUrl?.[1]?.url ||
            song.downloadUrl?.[0]?.url ||
            song.downloadUrl?.[4]?.link ||
            song.downloadUrl?.[0]?.link;

          if (!audioUrl) throw new Error("No download URL found for song");

          const safeTitle = (song.name || song.title || song.id).replace(/[^a-z0-9]/gi, '_').toLowerCase();
          const fileUri = `${FileSystem.documentDirectory}${safeTitle}_${song.id}.m4a`;

          const downloadResumable = FileSystem.createDownloadResumable(
            audioUrl,
            fileUri,
            {},
            () => {} // Progress callback if needed later
          );

          const result = await downloadResumable.downloadAsync();
          if (result) {
            const enhancedSong = { ...song, localUri: result.uri };
            set((state) => ({ downloadedSongs: [...state.downloadedSongs, enhancedSong] }));
          }
        } catch (error) {
          console.error("Download failed:", error);
        } finally {
          set((state) => ({ activeDownloads: state.activeDownloads.filter(id => id !== song.id) }));
        }
      },
      deleteDownload: async (id: string) => {
        const state = get();
        try {
          const target = state.downloadedSongs.find(s => s.id === id);
          if (target && target.localUri) {
            await FileSystem.deleteAsync(target.localUri, { idempotent: true });
            set({ downloadedSongs: state.downloadedSongs.filter(s => s.id !== id) });
          }
        } catch (error) {
          console.error("Failed to delete song:", error);
        }
      },
      isDownloaded: (id: string) => get().downloadedSongs.some(s => s.id === id)
    }),
    {
      name: 'download-storage', // name of item in storage
      storage: createJSONStorage(() => AsyncStorage), // use AsyncStorage
      partialize: (state) => ({ downloadedSongs: state.downloadedSongs }), // Only keep downloadedSongs persistently
    }
  )
);
