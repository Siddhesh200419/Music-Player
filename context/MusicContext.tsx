import { Audio } from "expo-av";
import React, { createContext, useContext, useEffect, useState } from "react";

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
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<any>(null);

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
    } catch (error) {
      console.error("Error playing song:", error);
    }
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
