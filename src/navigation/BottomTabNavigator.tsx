import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'react-native';
import { Home, Heart, ListMusic, Settings, ArrowDownCircle } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DownloadsScreen from '../screens/DownloadsScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const isDark = useColorScheme() === 'dark';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF8216',
        tabBarInactiveTintColor: isDark ? '#9E9E9E' : '#616161',
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.9)',
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color }) => <Home size={24} color={color} />
        }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{
          tabBarIcon: ({ color }) => <Heart size={24} color={color} />
        }}
      />
      <Tab.Screen 
        name="Downloads" 
        component={DownloadsScreen} 
        options={{
          tabBarIcon: ({ color }) => <ArrowDownCircle size={24} color={color} />
        }}
      />
      <Tab.Screen 
        name="Playlists" 
        component={PlaylistsScreen} 
        options={{
          tabBarIcon: ({ color }) => <ListMusic size={24} color={color} />
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}
