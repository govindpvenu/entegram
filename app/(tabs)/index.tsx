import * as React from "react";

import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useFilters } from "@/src/context/FilterContext";

export default function HomeScreen() {
  const router = useRouter();
  const { isHydrated } = useFilters();

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
      }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={{ gap: 12 }}>
        <Text
          style={{
            color: "#111827",
            fontSize: 32,
            fontWeight: "700",
          }}
        >
          Entegram
        </Text>
        <Text
          style={{
            color: "#4b5563",
            fontSize: 16,
            lineHeight: 24,
          }}
        >
          Instagram without distractions
        </Text>

        <Pressable
          accessibilityRole="button"
          disabled={!isHydrated}
          onPress={() => router.push("/instagram")}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: !isHydrated ? "#d1d5db" : "#111827",
            borderCurve: "continuous",
            borderRadius: 18,
            marginTop: 12,
            minHeight: 54,
            justifyContent: "center",
            opacity: pressed ? 0.85 : 1,
            paddingHorizontal: 18,
          })}
        >
          <Text
            style={{
              color: "#f9fafb",
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            Open Instagram
          </Text>
        </Pressable>

        {!isHydrated ? (
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: 10,
              marginTop: 4,
            }}
          >
            <ActivityIndicator color="#6b7280" size="small" />
            <Text style={{ color: "#6b7280", fontSize: 14 }}>
              Loading your filters...
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
