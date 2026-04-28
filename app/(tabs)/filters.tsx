import * as React from "react";

import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";

import { useFilters } from "@/src/context/FilterContext";
import { useLockIn } from "@/src/context/LockInContext";
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
  {
    key: "lockSharedReels",
    title: "Lock Shared Reels",
    description:
      "Allows reels opened from DMs, but blocks vertical swiping into more reels.",
  },
] satisfies readonly {
  description: string;
  key: keyof Filters;
  title: string;
}[];

export default function FiltersScreen() {
  const { filters, isHydrated, setFilter } = useFilters();
  const {
    isHydrated: isLockHydrated,
    isLockConfigured,
    isProtectedFilterChange,
    isUnlocked,
  } = useLockIn();

  const isLockActive = isLockConfigured && !isUnlocked;

  if (!isHydrated || !isLockHydrated) {
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
          Loading saved settings...
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
          DMs stay accessible. Shared reels can be locked to a single post.
          Stories remain visible until you explicitly hide them.
        </Text>
      </View>

      {isLockConfigured ? (
        <View
          style={{
            backgroundColor: isLockActive ? "#fff7ed" : "#ecfdf5",
            borderColor: isLockActive ? "#fdba74" : "#a7f3d0",
            borderCurve: "continuous",
            borderRadius: 18,
            borderWidth: 1,
            gap: 6,
            padding: 16,
          }}
        >
          <Text
            style={{
              color: isLockActive ? "#9a3412" : "#065f46",
              fontSize: 15,
              fontWeight: "700",
            }}
          >
            {isLockActive ? "LockIn is active" : "LockIn is unlocked"}
          </Text>
          <Text
            style={{
              color: isLockActive ? "#9a3412" : "#047857",
              fontSize: 13,
              lineHeight: 20,
            }}
          >
            {isLockActive
              ? "Enabled filters cannot be turned off until you unlock them from the LockIn tab."
              : "Enabled filters can be turned off right now. Relock from the LockIn tab when you are done."}
          </Text>
        </View>
      ) : null}

      {FILTER_OPTIONS.map((option) => {
        const currentValue = filters[option.key];
        const isToggleDisabled = isProtectedFilterChange(currentValue, false);

        return (
          <View
            key={option.key}
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#e5e7eb",
              borderCurve: "continuous",
              borderRadius: 18,
              borderWidth: 1,
              gap: 10,
              opacity: isToggleDisabled ? 0.72 : 1,
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
                {isToggleDisabled ? (
                  <Text
                    style={{
                      color: "#b45309",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Unlock from LockIn to disable this filter.
                  </Text>
                ) : null}
              </View>

              <Switch
                disabled={isToggleDisabled}
                onValueChange={(value) => {
                  if (isProtectedFilterChange(currentValue, value)) {
                    return;
                  }

                  setFilter(option.key, value);
                }}
                value={currentValue}
              />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
