import {
    DarkTheme,
    DefaultTheme,
    Stack,
    ThemeProvider,
    usePathname,
    useRouter,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import SplashAnimation from "@/components/common/SplashAnimation";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthSessionProvider } from "@/lib/auth/auth-session-context";
import { SmartHomeProvider } from "@/lib/context/smart-home-context";

/**
 * Configuracion inicial de Expo Router.
 *
 * `initialRouteName` indica que, cuando la app arranca, la ruta principal
 * esperada es `welcome`. Esto ayuda a que el flujo comience en la pantalla
 * de bienvenida y no en una ruta vacia.
 */
export const unstable_settings = {
  initialRouteName: "welcome",
};

/**
 * Layout raiz de la aplicacion.
 *
 * Este componente es el punto de entrada visual del proyecto. Su funcion no es
 * mostrar una pantalla especifica, sino envolver toda la app con proveedores
 * globales y registrar las rutas principales.
 *
 * Capas que configura:
 * - SafeAreaProvider: respeta notch, status bar y barra inferior en Android/iOS.
 * - ThemeProvider: entrega tema claro/oscuro a React Navigation.
 * - AuthSessionProvider: mantiene la sesion y el token seguro de autenticacion.
 * - SmartHomeProvider: estado global de hogares, dispositivos, sesion, tema e idioma.
 * - Stack: define el flujo de pantallas antes y despues del login.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [splashDone, setSplashDone] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const finishSplash = useCallback(() => {
    setSplashDone(true);

    if (pathname === "/") {
      router.replace("/welcome");
    }
  }, [pathname, router]);

  useEffect(() => {
    if (splashDone) return;

    const timeout = setTimeout(finishSplash, 2600);

    return () => clearTimeout(timeout);
  }, [finishSplash, splashDone]);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthSessionProvider>
          <SmartHomeProvider>
            {splashDone && (
              <Stack>
                <Stack.Screen
                  name="index"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="welcome"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="login"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="register"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="forgot-password"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="otp-verification"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="new-password"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="(tabs)"
                  options={{
                    headerShown: false,
                  }}
                />
              </Stack>
            )}

            {!splashDone && <SplashAnimation onFinish={finishSplash} />}
          </SmartHomeProvider>
        </AuthSessionProvider>

        <StatusBar style={splashDone ? "auto" : "light"} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
