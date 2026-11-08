import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import SplashAnimation from "@/components/common/SplashAnimation";
import {
  AuthSessionProvider,
  useAuthSession,
} from "@/lib/auth/auth-session-context";
import {
  SmartHomeProvider,
  useSmartHome,
} from "@/lib/context/smart-home-context";
import {
  hasSeenIntroSplash,
  markIntroSplashSeen,
} from "@/lib/preferences/intro-splash-preferences";
import { getAppTheme } from "@/lib/theme/app-theme";
import { markAppReady } from "@/lib/ui/app-ready";

// The native splash stays visible until we know what to show.
SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 200, fade: true });

export const unstable_settings = {
  initialRouteName: "welcome",
};

/**
 * checking: reading whether the animation was already seen (covers the native splash).
 * intro:    first time on this installation, the animation plays.
 * done:     the animation finished or does not apply.
 */
type IntroPhase = "checking" | "intro" | "done";

type RootNavigatorProps = {
  introPhase: IntroPhase;
  onIntroFinish: () => void;
  loadingBackground: string;
  loadingColor: string;
};

function RootNavigator({
  introPhase,
  onIntroFinish,
  loadingBackground,
  loadingColor,
}: RootNavigatorProps) {
  const { isAuthenticated, isLoading } = useAuthSession();

  // Hide the native splash:
  // - First time: as soon as the animation starts (same background, no jump).
  // - Other times: when the session is already restored, to go straight in.
  useEffect(() => {
    if (introPhase === "checking") return;
    if (introPhase === "intro" || !isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
    // The app is visible now: screens can animate their entrance.
    if (introPhase === "done" && !isLoading) {
      markAppReady();
    }
  }, [introPhase, isLoading]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Routes for authenticated users */}
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

        {/* Routes for users without a session */}
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="request-reactivation" />
        </Stack.Protected>

        {/* Recovery and activation links */}
        <Stack.Screen name="new-password" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="activate-account" />
        <Stack.Screen name="reactivate-account" />
        <Stack.Screen name="terms" />
      </Stack>

      {/* Welcome animation: only the first time per installation */}
      {introPhase === "intro" && (
        <SplashAnimation onFinish={onIntroFinish} />
      )}

      {/* Only shown if the animation finished and the session is not ready yet */}
      {introPhase === "done" && isLoading && (
        <View
          style={[
            styles.loadingOverlay,
            { backgroundColor: loadingBackground },
          ]}
        >
          <ActivityIndicator
            size="large"
            color={loadingColor}
          />
        </View>
      )}
    </>
  );
}

function RootContent({
  introPhase,
  onIntroFinish,
}: {
  introPhase: IntroPhase;
  onIntroFinish: () => void;
}) {
  const { colorPalette, effectiveColorMode } = useSmartHome();

  const theme = getAppTheme(effectiveColorMode, colorPalette);

  const baseNavigationTheme = theme.dark
    ? DarkTheme
    : DefaultTheme;
  const navigationTheme =
    colorPalette === "classic"
      ? baseNavigationTheme
      : {
          ...baseNavigationTheme,
          colors: {
            ...baseNavigationTheme.colors,
            primary: theme.primary,
            background: theme.background,
            card: theme.surface,
            text: theme.text,
            border: theme.border,
            notification: theme.danger,
          },
        };

  return (
    <ThemeProvider value={navigationTheme}>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
        }}
      >
        <RootNavigator
          introPhase={introPhase}
          onIntroFinish={onIntroFinish}
          loadingBackground={theme.background}
          loadingColor={theme.blue}
        />
      </View>

      <StatusBar
        animated
        style={
          introPhase === "done"
            ? theme.dark
              ? "light"
              : "dark"
            : "light"
        }
      />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [introPhase, setIntroPhase] = useState<IntroPhase>("checking");

  useEffect(() => {
    let active = true;

    hasSeenIntroSplash().then((seen) => {
      if (active) setIntroPhase(seen ? "done" : "intro");
    });

    return () => {
      active = false;
    };
  }, []);

  const finishIntro = useCallback(() => {
    setIntroPhase("done");
    void markIntroSplashSeen();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthSessionProvider>
        <SmartHomeProvider>
          <RootContent
            introPhase={introPhase}
            onIntroFinish={finishIntro}
          />
        </SmartHomeProvider>
      </AuthSessionProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});
