import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#111827",
        tabBarInactiveTintColor: "#6b7280",
        tabBarHideOnKeyboard: true,
        headerShadowVisible: false,
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
          title: "Filters",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="options-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="lock-in"
        options={{
          title: "LockIn",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="lock-closed-outline" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
