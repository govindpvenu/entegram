import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#111827",
        tabBarInactiveTintColor: "#6b7280",
        tabBarHideOnKeyboard: true,
        headerShown: false,
        headerShadowVisible: false,
        sceneStyle: {
          paddingTop: insets.top,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Entegram",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="home-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="filters"
        options={{
          href: null,
          title: "Filters",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="options-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="lock-in"
        options={{
          href: null,
          title: "LockIn",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="lock-closed-outline" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
