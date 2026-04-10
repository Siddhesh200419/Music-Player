import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import PlayerScreen from '../screens/PlayerScreen';
import SearchScreen from '../screens/SearchScreen';
import ArtistScreen from '../screens/ArtistScreen';
import AlbumScreen from '../screens/AlbumScreen';

const Stack = createNativeStackNavigator();

import { useColorScheme } from '@/hooks/use-color-scheme';



export default function RootNavigator() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? '#121212' : '#FFFFFF' }
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="Player" component={PlayerScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Artist" component={ArtistScreen} />
      <Stack.Screen name="Album" component={AlbumScreen} />
    </Stack.Navigator>
  );
}
