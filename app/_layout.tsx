import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import SplashAnimation from "@/components/common/SplashAnimation";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthSessionProvider, useAuthSession } from "@/lib/auth/auth-session-context";
import { SmartHomeProvider } from "@/lib/context/smart-home-context";
import { resolveAuthRedirect } from "@/lib/navigation/auth-route-policy";

export const unstable_settings = {
  initialRouteName: "welcome",
};

function RootNavigator({
  splashDone,
  onSplashFinish,
}: {
  splashDone: boolean;
  onSplashFinish: () => void;
}) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAuthSession();
  const firstSegment = segments[0];

  useEffect(() => {
    if (!splashDone || isLoading) return;

    console.log("[RootGuard]", {
      segments,
      isAuthenticated,
      isLoading,
    });

    const redirectHref = resolveAuthRedirect({
      firstSegment,
      isAuthenticated,
      isLoading,
      splashDone,
    });

    if (redirectHref) router.replace(redirectHref);
  }, [
    firstSegment,
    isAuthenticated,
    isLoading,
    router,
    segments,
    splashDone,
  ]);

  return (
    <>
      {splashDone && (
        <Stack>
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen
            name="forgot-password"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="request-reactivation"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="new-password" options={{ headerShown: false }} />
          <Stack.Screen name="reset-password" options={{ headerShown: false }} />
          <Stack.Screen
            name="activate-account"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="reactivate-account"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      )}

      {!splashDone && <SplashAnimation onFinish={onSplashFinish} />}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [splashDone, setSplashDone] = useState(false);

  const finishSplash = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthSessionProvider>
          <SmartHomeProvider>
            <RootNavigator
              onSplashFinish={finishSplash}
              splashDone={splashDone}
            />
          </SmartHomeProvider>
        </AuthSessionProvider>

        <StatusBar style={splashDone ? "auto" : "light"} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
