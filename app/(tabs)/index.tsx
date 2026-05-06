import * as React from "react";

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useFilters } from "@/src/context/FilterContext";

const FEATURE_CARDS = [
  {
    description:
      "Hide Reels, Explore, the home feed, suggestions, and stories when you need a calmer Instagram.",
    icon: "options-outline",
    title: "Custom Filters",
  },
  {
    description:
      "Open reels sent in DMs without getting pulled into endless vertical swiping.",
    icon: "swap-vertical-outline",
    title: "Shared Reel Lock",
  },
  {
    description:
      "Protect enabled filters behind a password so they cannot be turned off casually.",
    icon: "lock-closed-outline",
    title: "LockIn Protection",
  },
] satisfies readonly {
  description: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
}[];

export default function HomeScreen() {
  const router = useRouter();
  const { isHydrated } = useFilters();

  return (
    <ScrollView
      contentContainerStyle={{
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        gap: 28,
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 28,
        paddingTop: 32,
      }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View
        style={{
          alignItems: "center",
          gap: 18,
          maxWidth: 420,
          width: "100%",
        }}
      >
        <Image
          accessibilityLabel="Entegram logo"
          contentFit="contain"
          source={require("../../assets/images/icon-circle.png")}
          style={{
            height: 72,
            width: 72,
          }}
        />
        <Text
          style={{
            color: "#111827",
            fontSize: 34,
            fontWeight: "800",
            lineHeight: 40,
            textAlign: "center",
          }}
        >
          Stay Connected,{"\n"}without the noise.
        </Text>
        <Text
          style={{
            color: "#6b7280",
            fontSize: 15,
            fontWeight: "600",
            lineHeight: 23,
            maxWidth: 320,
            textAlign: "center",
          }}
        >
          Check your messeges, post a story and... LEAVEE!! - without losing an
          hour.
        </Text>

        <Pressable
          accessibilityRole="button"
          disabled={!isHydrated}
          onPress={() => router.push("/instagram")}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: !isHydrated ? "#d1d5db" : "#111827",
            borderCurve: "continuous",
            borderRadius: 999,
            boxShadow: !isHydrated
              ? "none"
              : "0 14px 28px rgba(17, 24, 39, 0.18)",
            marginTop: 20,
            minHeight: 50,
            minWidth: 172,
            justifyContent: "center",
            opacity: pressed ? 0.85 : 1,
            paddingHorizontal: 24,
          })}
        >
          <Text
            style={{
              color: "#f9fafb",
              fontSize: 14,
              fontWeight: "700",
            }}
          >
            Launch App
          </Text>
        </Pressable>

        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            gap: 8,
            minHeight: 20,
          }}
        >
          {!isHydrated ? (
            <ActivityIndicator color="#6b7280" size="small" />
          ) : null}
          <Text
            style={{
              color: "#9ca3af",
              fontSize: 13,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            {isHydrated
              ? "Distractions hidden by default."
              : "Loading your filters..."}
          </Text>
        </View>
      </View>

      <View
        style={{
          gap: 18,
          maxWidth: 420,
          width: "100%",
        }}
      >
        {FEATURE_CARDS.map((feature) => (
          <View
            key={feature.title}
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#eef2f7",
              borderCurve: "continuous",
              borderRadius: 16,
              borderWidth: 1,
              boxShadow: "0 10px 24px rgba(17, 24, 39, 0.06)",
              gap: 10,
              padding: 20,
            }}
          >
            <Ionicons color="#111827" name={feature.icon} size={22} />
            <Text
              style={{
                color: "#111827",
                fontSize: 20,
                fontWeight: "800",
              }}
            >
              {feature.title}
            </Text>
            <Text
              style={{
                color: "#6b7280",
                fontSize: 14,
                fontWeight: "600",
                lineHeight: 21,
              }}
            >
              {feature.description}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
