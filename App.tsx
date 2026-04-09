import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme, useNavigationContainerRef } from '@react-navigation/native';
import React, { useState } from 'react';
import { MusicProvider } from './context/MusicContext';
import { useColorScheme } from './hooks/use-color-scheme';
import RootNavigator from './src/navigation/RootNavigator';
import MiniPlayer from './components/MiniPlayer';

export default function App() {
  const colorScheme = useColorScheme();
  const navigationRef = useNavigationContainerRef();
  const [routeName, setRouteName] = useState<string>();

  return (
    <MusicProvider>
      <NavigationContainer 
        ref={navigationRef}
        theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        onReady={() => setRouteName(navigationRef.getCurrentRoute()?.name)}
        onStateChange={() => setRouteName(navigationRef.getCurrentRoute()?.name)}
      >
        <View style={styles.container}>
          <RootNavigator />
          <MiniPlayer currentRouteName={routeName} />
        </View>
        <StatusBar style="auto" />
      </NavigationContainer>
    </MusicProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
