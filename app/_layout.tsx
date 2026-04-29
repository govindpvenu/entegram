import { Stack } from "expo-router";

import { FilterProvider } from "@/src/context/FilterContext";
import { LockInProvider } from "@/src/context/LockInContext";

export default function RootLayout() {
  return (
    <LockInProvider>
      <FilterProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="instagram" options={{ headerShown: false }} />
        </Stack>
      </FilterProvider>
    </LockInProvider>
  );
}
