import React, { createContext, useContext, useEffect, useState } from 'react';
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

interface DownloadContextType {
  downloadedSongs: DownloadedSong[];
  activeDownloads: string[];
  downloadSong: (song: any) => Promise<void>;
  deleteDownload: (id: string) => Promise<void>;
  isDownloaded: (id: string) => boolean;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [downloadedSongs, setDownloadedSongs] = useState<DownloadedSong[]>([]);
  const [activeDownloads, setActiveDownloads] = useState<string[]>([]);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      const data = await AsyncStorage.getItem('downloadedSongs');
      if (data) {
        setDownloadedSongs(JSON.parse(data));
      }
    } catch (error) {
      console.error("Failed to load downloads array:", error);
    }
  };

  const saveDownloads = async (newDownloads: DownloadedSong[]) => {
    try {
      await AsyncStorage.setItem('downloadedSongs', JSON.stringify(newDownloads));
      setDownloadedSongs(newDownloads);
    } catch (error) {
      console.error("Failed to save downloads array:", error);
    }
  };

  const downloadSong = async (song: any) => {
    if (activeDownloads.includes(song.id) || isDownloaded(song.id)) return;

    setActiveDownloads(prev => [...prev, song.id]);

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

      // Replace generic characters to make a safe filesystem filename
      const safeTitle = (song.name || song.title || song.id).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileUri = `${FileSystem.documentDirectory}${safeTitle}_${song.id}.m4a`;

      const downloadResumable = FileSystem.createDownloadResumable(
        audioUrl,
        fileUri,
        {},
        (downloadProgress) => {
          // Future mapping to progress UI if needed
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (result) {
        const enhancedSong = { ...song, localUri: result.uri };
        const updated = [...downloadedSongs, enhancedSong];
        await saveDownloads(updated);
      }
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setActiveDownloads(prev => prev.filter(id => id !== song.id));
    }
  };

  const deleteDownload = async (id: string) => {
    try {
      const target = downloadedSongs.find(s => s.id === id);
      if (target && target.localUri) {
        await FileSystem.deleteAsync(target.localUri, { idempotent: true });
        const updated = downloadedSongs.filter(s => s.id !== id);
        await saveDownloads(updated);
      }
    } catch (error) {
      console.error("Failed to delete song:", error);
    }
  };

  const isDownloaded = (id: string) => downloadedSongs.some(s => s.id === id);

  return (
    <DownloadContext.Provider value={{ downloadedSongs, activeDownloads, downloadSong, deleteDownload, isDownloaded }}>
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownloads = () => {
  const context = useContext(DownloadContext);
  if (context === undefined) {
    throw new Error("useDownloads must be used within a DownloadProvider");
  }
  return context;
};
