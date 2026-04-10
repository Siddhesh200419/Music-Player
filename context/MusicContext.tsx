import { Audio } from "expo-av";
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Song {
  id: string;
  name: string;
  album: { name: string };
  image: { url: string; link?: string; quality: string }[];
  primaryArtists?: string;
  artists?: { primary: { name: string }[] };
  downloadUrl: { url: string; link?: string; quality: string }[];
  duration: number;
}

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => Promise<void>;
  pauseSong: () => Promise<void>;
  resumeSong: () => Promise<void>;
  stopSong: () => Promise<void>;
  playbackStatus: any;
  seekTo: (position: number) => Promise<void>;
  queue: Song[];
  queueIndex: number;
  addToQueue: (song: Song) => Promise<void>;
  removeFromQueue: (index: number) => Promise<void>;
  reorderQueue: (newQueue: Song[]) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  clearQueue: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<any>(null);

  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);

  const playNextRef = React.useRef<any>(null);

  // Load Queue & Current Song from storage on mount
  useEffect(() => {
    AsyncStorage.getItem('musicQueue').then(data => {
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.queue) setQueue(parsed.queue);
        if (parsed.queueIndex !== undefined) setQueueIndex(parsed.queueIndex);
        if (parsed.currentSong) setCurrentSong(parsed.currentSong);
      }
    }).catch(console.error);
  }, []);

  // Save to storage whenever queue changes
  useEffect(() => {
    if (queue.length > 0 || currentSong) {
      AsyncStorage.setItem('musicQueue', JSON.stringify({ queue, queueIndex, currentSong })).catch(console.error);
    }
  }, [queue, queueIndex, currentSong]);

  useEffect(() => {
    // Enable playback in silence mode / background for iOS and Android
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const onPlaybackStatusUpdate = (status: any) => {
    setPlaybackStatus(status);
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        // Invoke the latest playNext through the ref to bypass closure staleness
        setTimeout(() => {
          if (playNextRef.current) {
            playNextRef.current();
          }
        }, 100);
      }
    }
  };

  const playSong = async (song: Song) => {
    try {
      console.log("Playing song:", song.name);
      if (sound) {
        await sound.unloadAsync();
      }

      // Find highest quality download URL
      const audioUrl =
        song.downloadUrl?.[4]?.url ||
        song.downloadUrl?.[3]?.url ||
        song.downloadUrl?.[2]?.url ||
        song.downloadUrl?.[1]?.url ||
        song.downloadUrl?.[0]?.url ||
        song.downloadUrl?.[4]?.link ||
        song.downloadUrl?.[0]?.link;

      if (!audioUrl) {
        console.error("No download URL found for song");
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate,
      );

      setSound(newSound);
      setCurrentSong(song);
      setIsPlaying(true);
      
      // If we play a song directly, let's inject it into front of queue if not already playing from queue
      // For simplicity, we just leave queue intact and set currentSong.
    } catch (error) {
      console.error("Error playing song:", error);
    }
  };

  const playNext = async () => {
    if (queue.length === 0) return;
    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) {
      setQueueIndex(nextIndex);
      await playSong(queue[nextIndex]);
    } else {
      // Reached the end
      setIsPlaying(false);
    }
  };

  React.useEffect(() => {
    playNextRef.current = playNext;
  }, [queue, queueIndex, playSong]);

  const playPrevious = async () => {
    if (queue.length === 0) return;
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      setQueueIndex(prevIndex);
      await playSong(queue[prevIndex]);
    } else {
      // If at start, restart current song
      if (sound) await sound.setPositionAsync(0);
    }
  };

  const addToQueue = async (song: Song) => {
    setQueue((prevQueue) => {
      const newQueue = [...prevQueue, song];
      if (!currentSong) {
        setQueueIndex(0);
        playSong(song);
      }
      return newQueue;
    });
  };

  const removeFromQueue = async (index: number) => {
    setQueue((prevQueue) => {
      const newQueue = [...prevQueue];
      newQueue.splice(index, 1);
      if (index < queueIndex) {
        setQueueIndex(queueIndex - 1);
      }
      return newQueue;
    });
  };

  const reorderQueue = async (newQueue: Song[]) => {
    setQueue(newQueue);
    // Note: queueIndex might become desynced visually if the currently playing song is dragged. 
    // Usually you'd track the current song ID to maintain queueIndex, but this works for basics.
  };

  const clearQueue = async () => {
    setQueue([]);
    setQueueIndex(-1);
  };

  const pauseSong = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resumeSong = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const stopSong = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const seekTo = async (position: number) => {
    if (sound) {
      await sound.setPositionAsync(position);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        isPlaying,
        playSong,
        pauseSong,
        resumeSong,
        stopSong,
        playbackStatus,
        seekTo,
        queue,
        queueIndex,
        addToQueue,
        removeFromQueue,
        reorderQueue,
        playNext,
        playPrevious,
        clearQueue,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
};
