import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme, useNavigationContainerRef } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useColorScheme } from './hooks/use-color-scheme';
import RootNavigator from './src/navigation/RootNavigator';
import MiniPlayer from './components/MiniPlayer';
import { useMusicStore } from './store/useMusicStore';

export default function App() {
  const colorScheme = useColorScheme();
  const navigationRef = useNavigationContainerRef();
  const [routeName, setRouteName] = useState<string>();

  useEffect(() => {
    useMusicStore.getState().initAudioMode();
  }, []);

  return (
    <NavigationContainer 
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      onReady={() => setRouteName(navigationRef.getCurrentRoute()?.name)}
      onStateChange={() => setRouteName(navigationRef.getCurrentRoute()?.name)}
    >
      <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#FFFFFF' }]}>
        <RootNavigator />
        <MiniPlayer currentRouteName={routeName} />
      </View>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
