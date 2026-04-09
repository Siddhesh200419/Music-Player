import { MusicProvider } from "@/context/MusicContext";
import MiniPlayer from "@/components/MiniPlayer";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <MusicProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View style={styles.container}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="player"
              options={{ presentation: "modal", headerShown: false }}
            />
            <Stack.Screen name="search" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <MiniPlayer />
        </View>
        <StatusBar style="auto" />
      </ThemeProvider>
    </MusicProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
