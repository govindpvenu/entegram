import * as React from "react";

import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";

import { useFilters } from "@/src/context/FilterContext";
import type { Filters } from "@/src/types/filters";

const FILTER_OPTIONS = [
  {
    key: "hideReels",
    title: "Hide Reels",
    description: "Removes Reels entry points and labels when possible.",
  },
  {
    key: "hideExplore",
    title: "Hide Explore",
    description: "Removes Explore entry points and labels when possible.",
  },
  {
    key: "hideHomeFeed",
    title: "Hide Home Feed",
    description: "Keeps the Instagram shell but hides the home timeline after login.",
  },
  {
    key: "hideSuggestions",
    title: "Hide Suggestion",
    description: 'Removes suggestion sections such as "Suggested for you".',
  },
  {
    key: "hideStories",
    title: "Hide Stories",
    description: "Off by default so stories stay usable unless you opt in.",
  },
] satisfies readonly {
  description: string;
  key: keyof Filters;
  title: string;
}[];

export default function FiltersScreen() {
  const { filters, isHydrated, setFilter } = useFilters();

  if (!isHydrated) {
    return (
      <View
        style={{
          alignItems: "center",
          flex: 1,
          gap: 12,
          justifyContent: "center",
          padding: 24,
        }}
      >
        <ActivityIndicator color="#6b7280" size="large" />
        <Text style={{ color: "#6b7280", fontSize: 14 }}>
          Loading saved filters...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        gap: 16,
        padding: 20,
      }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={{ gap: 8 }}>
        <Text
          style={{
            color: "#111827",
            fontSize: 22,
            fontWeight: "700",
          }}
        >
          Filters
        </Text>
        <Text
          style={{
            color: "#4b5563",
            fontSize: 14,
            lineHeight: 22,
          }}
        >
          DMs stay accessible. Stories remain visible until you explicitly hide
          them.
        </Text>
      </View>

      {FILTER_OPTIONS.map((option) => (
        <View
          key={option.key}
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#e5e7eb",
            borderCurve: "continuous",
            borderRadius: 18,
            borderWidth: 1,
            gap: 10,
            padding: 16,
          }}
        >
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: 12,
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  color: "#111827",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {option.title}
              </Text>
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: 13,
                  lineHeight: 20,
                }}
              >
                {option.description}
              </Text>
            </View>

            <Switch
              onValueChange={(value) => setFilter(option.key, value)}
              value={filters[option.key]}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
