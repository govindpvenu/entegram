import * as React from "react";

import { Stack } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import WebView from "react-native-webview";

import { useFilters } from "@/src/context/FilterContext";
import { buildInstagramFilterScript } from "@/src/utils/buildInstagramFilterScript";

const INSTAGRAM_URL = "https://www.instagram.com/";

function LoadingState({ label }: { label: string }) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: "#ffffff",
        flex: 1,
        gap: 12,
        justifyContent: "center",
        padding: 24,
      }}
    >
      <ActivityIndicator color="#111827" size="large" />
      <Text style={{ color: "#4b5563", fontSize: 14 }}>{label}</Text>
    </View>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: "#ffffff",
        flex: 1,
        gap: 14,
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Text
        selectable
        style={{
          color: "#111827",
          fontSize: 18,
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        Instagram could not be loaded
      </Text>
      <Text
        selectable
        style={{
          color: "#6b7280",
          fontSize: 14,
          lineHeight: 22,
          textAlign: "center",
        }}
      >
        {message}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => ({
          backgroundColor: "#111827",
          borderCurve: "continuous",
          borderRadius: 18,
          opacity: pressed ? 0.85 : 1,
          paddingHorizontal: 20,
          paddingVertical: 14,
        })}
      >
        <Text
          style={{
            color: "#f9fafb",
            fontSize: 15,
            fontWeight: "600",
          }}
        >
          Retry
        </Text>
      </Pressable>
    </View>
  );
}

export default function InstagramScreen() {
  const webViewRef = React.useRef<WebView | null>(null);
  const { filters, isHydrated } = useFilters();
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [webViewKey, setWebViewKey] = React.useState(0);
  const injectedScript = buildInstagramFilterScript(filters);

  function handleRetry() {
    setLoadError(null);
    setWebViewKey((current) => current + 1);
  }

  if (!isHydrated) {
    return <LoadingState label="Loading your filters..." />;
  }

  if (loadError) {
    return <ErrorState message={loadError} onRetry={handleRetry} />;
  }

  return (
    <View style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <Stack.Screen options={{ title: "Instagram" }} />
      <WebView
        key={webViewKey}
        ref={webViewRef}
        domStorageEnabled
        injectedJavaScript={injectedScript}
        javaScriptEnabled
        onError={(event) => {
          const description =
            event.nativeEvent.description || "A network error occurred.";
          setLoadError(description);
        }}
        onHttpError={(event) => {
          setLoadError(
            `Instagram returned status ${event.nativeEvent.statusCode}.`,
          );
        }}
        onLoadEnd={() => {
          webViewRef.current?.injectJavaScript(injectedScript);
        }}
        onLoadStart={() => {
          setLoadError(null);
        }}
        renderLoading={() => <LoadingState label="Loading Instagram..." />}
        setSupportMultipleWindows={false}
        sharedCookiesEnabled
        source={{ uri: INSTAGRAM_URL }}
        startInLoadingState
        thirdPartyCookiesEnabled
      />
    </View>
  );
}
