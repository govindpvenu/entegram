import * as React from "react";

import {
  useFocusEffect,
  useNavigation,
  usePreventRemove,
} from "@react-navigation/native";
import type { NavigationAction } from "@react-navigation/routers";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import WebView from "react-native-webview";

import { useFilters } from "@/src/context/FilterContext";
import { buildInstagramFilterScript } from "@/src/utils/buildInstagramFilterScript";

const INSTAGRAM_URL = "https://www.instagram.com/";
const SHARED_REEL_LOCK_MESSAGE = "entegram.sharedReelLock";
const WEBVIEW_NAVIGATION_MESSAGE = "entegram.webviewNavigation";

const WEBVIEW_NAVIGATION_SCRIPT = `
  (function() {
    const MESSAGE_TYPE = "${WEBVIEW_NAVIGATION_MESSAGE}";
    const PATCHED_KEY = "__entegramWebViewNavigationPatched";

    function isInstagramHome() {
      return (
        (location.hostname === "instagram.com" ||
          location.hostname.endsWith(".instagram.com")) &&
        (location.pathname === "/" || location.pathname === "")
      );
    }

    function postNavigationState() {
      try {
        window.ReactNativeWebView?.postMessage(
          JSON.stringify({
            type: MESSAGE_TYPE,
            url: location.href,
            historyLength: history.length,
            isInstagramHome: isInstagramHome(),
          })
        );
      } catch (error) {}
    }

    if (!window[PATCHED_KEY]) {
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function() {
        const result = originalPushState.apply(this, arguments);
        postNavigationState();
        return result;
      };

      history.replaceState = function() {
        const result = originalReplaceState.apply(this, arguments);
        postNavigationState();
        return result;
      };

      window.addEventListener("popstate", postNavigationState);
      window.addEventListener("hashchange", postNavigationState);
      window[PATCHED_KEY] = true;
    }

    postNavigationState();
  })();
  true;
`;

type WebViewNavigationSnapshot = {
  canGoBack: boolean;
  historyLength: number;
  isInstagramHome: boolean;
  url: string;
};

function isInstagramHomeUrl(value: string) {
  try {
    const url = new URL(value);

    return (
      (url.hostname === "instagram.com" ||
        url.hostname.endsWith(".instagram.com")) &&
      (url.pathname === "/" || url.pathname === "")
    );
  } catch {
    return false;
  }
}

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
  const navigation = useNavigation();
  const { filters, isHydrated } = useFilters();
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [isSharedReelLocked, setIsSharedReelLocked] = React.useState(false);
  const [isExitModalVisible, setIsExitModalVisible] = React.useState(false);
  const [isExitConfirmed, setIsExitConfirmed] = React.useState(false);
  const [webViewKey, setWebViewKey] = React.useState(0);
  const [webViewNavigation, setWebViewNavigation] =
    React.useState<WebViewNavigationSnapshot>({
      canGoBack: false,
      historyLength: 1,
      isInstagramHome: true,
      url: INSTAGRAM_URL,
    });
  const pendingExitActionRef = React.useRef<NavigationAction | null>(null);
  const webViewNavigationRef =
    React.useRef<WebViewNavigationSnapshot>(webViewNavigation);
  const injectedScript = React.useMemo(
    () => `${buildInstagramFilterScript(filters)}\n${WEBVIEW_NAVIGATION_SCRIPT}`,
    [filters],
  );
  const canUseWebViewBack =
    !webViewNavigation.isInstagramHome &&
    (webViewNavigation.canGoBack || webViewNavigation.historyLength > 1);
  const canUseWebViewBackRef = React.useRef(canUseWebViewBack);

  function updateWebViewNavigationState(
    nextState: Partial<WebViewNavigationSnapshot>,
  ) {
    setWebViewNavigation((currentState) => {
      const nextUrl = nextState.url ?? currentState.url;
      const updatedState = {
        canGoBack: nextState.canGoBack ?? currentState.canGoBack,
        historyLength: nextState.historyLength ?? currentState.historyLength,
        isInstagramHome:
          nextState.isInstagramHome ?? isInstagramHomeUrl(nextUrl),
        url: nextUrl,
      };

      webViewNavigationRef.current = updatedState;
      canUseWebViewBackRef.current =
        !updatedState.isInstagramHome &&
        (updatedState.canGoBack || updatedState.historyLength > 1);

      if (
        currentState.canGoBack === updatedState.canGoBack &&
        currentState.historyLength === updatedState.historyLength &&
        currentState.isInstagramHome === updatedState.isInstagramHome &&
        currentState.url === updatedState.url
      ) {
        return currentState;
      }

      return updatedState;
    });
  }

  function handleRetry() {
    setLoadError(null);
    setIsSharedReelLocked(false);
    updateWebViewNavigationState({
      canGoBack: false,
      historyLength: 1,
      isInstagramHome: true,
      url: INSTAGRAM_URL,
    });
    setWebViewKey((current) => current + 1);
  }

  const showExitConfirmation = React.useCallback(() => {
    setIsExitModalVisible(true);
  }, []);

  const handleBackRequest = React.useCallback(() => {
    const navigationState = webViewNavigationRef.current;

    if (canUseWebViewBackRef.current) {
      if (navigationState.canGoBack) {
        webViewRef.current?.goBack();
      } else {
        webViewRef.current?.injectJavaScript("history.back(); true;");
      }

      return true;
    }

    showExitConfirmation();
    return true;
  }, [showExitConfirmation]);

  const handleCancelExit = React.useCallback(() => {
    pendingExitActionRef.current = null;
    setIsExitModalVisible(false);
  }, []);

  const handleConfirmExit = React.useCallback(() => {
    setIsExitModalVisible(false);
    setIsExitConfirmed(true);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackRequest,
      );

      return () => {
        subscription.remove();
      };
    }, [handleBackRequest]),
  );

  usePreventRemove(!isExitConfirmed, ({ data }) => {
    pendingExitActionRef.current = data.action;
    handleBackRequest();
  });

  React.useEffect(() => {
    canUseWebViewBackRef.current = canUseWebViewBack;
  }, [canUseWebViewBack]);

  React.useEffect(() => {
    if (!isExitConfirmed) {
      return;
    }

    const pendingExitAction = pendingExitActionRef.current;
    pendingExitActionRef.current = null;

    if (pendingExitAction) {
      navigation.dispatch(pendingExitAction);
      return;
    }

    navigation.goBack();
  }, [isExitConfirmed, navigation]);

  React.useEffect(() => {
    if (!isHydrated) {
      return;
    }

    webViewRef.current?.injectJavaScript(injectedScript);
  }, [injectedScript, isHydrated]);

  if (!isHydrated) {
    return <LoadingState label="Loading your filters..." />;
  }

  if (loadError) {
    return <ErrorState message={loadError} onRetry={handleRetry} />;
  }

  return (
    <View style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <Stack.Screen
        options={{
          gestureEnabled: !canUseWebViewBack,
          title: "Instagram",
        }}
      />
      <WebView
        key={webViewKey}
        ref={webViewRef}
        allowsBackForwardNavigationGestures={canUseWebViewBack}
        domStorageEnabled
        injectedJavaScript={injectedScript}
        injectedJavaScriptBeforeContentLoaded={injectedScript}
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
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data);

            if (message?.type === SHARED_REEL_LOCK_MESSAGE) {
              setIsSharedReelLocked(Boolean(message.isLocked));
            }

            if (message?.type === WEBVIEW_NAVIGATION_MESSAGE) {
              updateWebViewNavigationState({
                historyLength:
                  typeof message.historyLength === "number"
                    ? message.historyLength
                    : undefined,
                isInstagramHome:
                  typeof message.isInstagramHome === "boolean"
                    ? message.isInstagramHome
                    : undefined,
                url:
                  typeof message.url === "string" ? message.url : undefined,
              });
            }
          } catch {
            // Ignore unrelated messages from the page.
          }
        }}
        onNavigationStateChange={(navigationState) => {
          updateWebViewNavigationState({
            canGoBack: navigationState.canGoBack,
            isInstagramHome: isInstagramHomeUrl(navigationState.url),
            url: navigationState.url,
          });
        }}
        renderLoading={() => <LoadingState label="Loading Instagram..." />}
        scrollEnabled={!isSharedReelLocked}
        setSupportMultipleWindows={false}
        sharedCookiesEnabled
        source={{ uri: INSTAGRAM_URL }}
        startInLoadingState
        thirdPartyCookiesEnabled
      />
      <Modal
        animationType="fade"
        onRequestClose={handleCancelExit}
        transparent
        visible={isExitModalVisible}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: "rgba(17, 24, 39, 0.42)",
            flex: 1,
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: "#ffffff",
              borderCurve: "continuous",
              borderRadius: 22,
              gap: 18,
              padding: 20,
              width: "100%",
            }}
          >
            <View style={{ gap: 8 }}>
              <Text
                selectable
                style={{
                  color: "#111827",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                Exit Instagram?
              </Text>
              <Text
                selectable
                style={{
                  color: "#4b5563",
                  fontSize: 14,
                  lineHeight: 22,
                }}
              >
                Are you sure you want to exit to the app?
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                accessibilityRole="button"
                onPress={handleCancelExit}
                style={({ pressed }) => ({
                  alignItems: "center",
                  backgroundColor: "#f3f4f6",
                  borderCurve: "continuous",
                  borderRadius: 16,
                  flex: 1,
                  justifyContent: "center",
                  minHeight: 48,
                  opacity: pressed ? 0.85 : 1,
                  paddingHorizontal: 16,
                })}
              >
                <Text
                  style={{
                    color: "#111827",
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Stay
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleConfirmExit}
                style={({ pressed }) => ({
                  alignItems: "center",
                  backgroundColor: "#111827",
                  borderCurve: "continuous",
                  borderRadius: 16,
                  flex: 1,
                  justifyContent: "center",
                  minHeight: 48,
                  opacity: pressed ? 0.85 : 1,
                  paddingHorizontal: 16,
                })}
              >
                <Text
                  style={{
                    color: "#f9fafb",
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Exit
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
