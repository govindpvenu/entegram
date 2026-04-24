import { Stack } from "expo-router";

import { FilterProvider } from "@/src/context/FilterContext";

export default function RootLayout() {
  return (
    <FilterProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="instagram" options={{ title: "Instagram" }} />
      </Stack>
    </FilterProvider>
  );
}
