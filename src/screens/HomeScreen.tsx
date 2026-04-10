import HomeAlbums from "@/components/home/HomeAlbums";
import HomeArtists from "@/components/home/HomeArtists";
import HomeSongs from "@/components/home/HomeSongs";
import HomeSuggested from "@/components/home/HomeSuggested";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { Music, Search } from "lucide-react-native";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Tab = createMaterialTopTabNavigator();

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation<any>();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#FFFFFF" },
      ]}
    >
      <View style={styles.statusBarPadding} />
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Music size={28} color="#FF8216" />
          <Text
            style={[styles.title, { color: isDark ? "#FFFFFF" : "#000000" }]}
          >
            Mume
          </Text>
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate("Search")}
        >
          <Search size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
      </View>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#FF8216",
          tabBarInactiveTintColor: isDark ? "#9E9E9E" : "#616161",
          tabBarIndicatorStyle: { backgroundColor: "#FF8216", height: 3 },
          tabBarScrollEnabled: true,
          tabBarItemStyle: {
            width: "auto",
            paddingHorizontal: 16,
            minWidth: 100,
          },
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: "bold",
            textTransform: "none",
          },
          tabBarStyle: {
            backgroundColor: isDark ? "#121212" : "#FFFFFF",
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      >
        <Tab.Screen name="Suggested" component={HomeSuggested} />
        <Tab.Screen name="Songs" component={HomeSongs} />
        <Tab.Screen name="Artists" component={HomeArtists} />
        <Tab.Screen name="Albums" component={HomeAlbums} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarPadding: {
    height: Platform.OS === "android" ? Constants.statusBarHeight : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchButton: {
    padding: 5,
  },
});