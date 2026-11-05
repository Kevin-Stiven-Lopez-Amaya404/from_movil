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

// El splash nativo se mantiene visible hasta que sepamos qué mostrar.
SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 200, fade: true });

export const unstable_settings = {
  initialRouteName: "welcome",
};

/**
 * checking: leyendo si ya se vio la animación (cubre el splash nativo).
 * intro:    primera vez en esta instalación, se reproduce la animación.
 * done:     la animación terminó o no corresponde mostrarla.
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

  // Ocultar el splash nativo:
  // - Primera vez: en cuanto arranca la animación (mismo fondo, sin salto).
  // - Resto de veces: cuando la sesión ya está restaurada, para entrar directo.
  useEffect(() => {
    if (introPhase === "checking") return;
    if (introPhase === "intro" || !isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
    // La app ya es visible: las pantallas pueden animar su entrada.
    if (introPhase === "done" && !isLoading) {
      markAppReady();
    }
  }, [introPhase, isLoading]);

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
        <Stack.Screen name="terms" />
      </Stack>

      {/* Animación de bienvenida: solo la primera vez por instalación */}
      {introPhase === "intro" && (
        <SplashAnimation onFinish={onIntroFinish} />
      )}

      {/* Solo aparece si la animación terminó y la sesión aún no está lista */}
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
