
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
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
import { getAppTheme } from "@/lib/theme/app-theme";

export const unstable_settings = {
  initialRouteName: "welcome",
};

type RootNavigatorProps = {
  splashDone: boolean;
  onSplashFinish: () => void;
  loadingBackground: string;
  loadingColor: string;
};

function RootNavigator({
  splashDone,
  onSplashFinish,
  loadingBackground,
  loadingColor,
}: RootNavigatorProps) {
  const { isAuthenticated, isLoading } = useAuthSession();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Rutas de usuarios autenticados */}
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

        {/* Rutas de usuarios sin sesión */}
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="request-reactivation" />
        </Stack.Protected>

        {/* Enlaces de recuperación y activación */}
        <Stack.Screen name="new-password" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="activate-account" />
        <Stack.Screen name="reactivate-account" />
      </Stack>

      {/* Splash visual sin desmontar el navegador */}
      {!splashDone && (
        <SplashAnimation onFinish={onSplashFinish} />
      )}

      {/* Esperar la restauración de la sesión */}
      {splashDone && isLoading && (
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
  splashDone,
  onSplashFinish,
}: {
  splashDone: boolean;
  onSplashFinish: () => void;
}) {
  const { effectiveColorMode } = useSmartHome();

  const theme = getAppTheme(effectiveColorMode);

  const navigationTheme = theme.dark
    ? DarkTheme
    : DefaultTheme;

  return (
    <ThemeProvider value={navigationTheme}>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
        }}
      >
        <RootNavigator
          splashDone={splashDone}
          onSplashFinish={onSplashFinish}
          loadingBackground={theme.background}
          loadingColor={theme.blue}
        />
      </View>

      <StatusBar
        animated
        style={
          splashDone
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
  const [splashDone, setSplashDone] = useState(false);

  const finishSplash = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <SafeAreaProvider>
      <AuthSessionProvider>
        <SmartHomeProvider>
          <RootContent
            onSplashFinish={finishSplash}
            splashDone={splashDone}
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
