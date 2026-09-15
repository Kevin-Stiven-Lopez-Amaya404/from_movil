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
 * - SmartHomeProvider: estado global de hogares, dispositivos, sesion, tema e idioma.
 * - Stack: define el flujo de pantallas antes y despues del login.
 */
export default function RootLayout() {
  // Detecta el modo de color del sistema para el tema base de navegacion.
  const colorScheme = useColorScheme();

  // Controla si la animacion inicial ya termino. Mientras sea false se muestra SplashAnimation.
  const [splashDone, setSplashDone] = useState(false);

  // Router y pathname permiten redirigir despues del splash si la app esta en la ruta raiz.
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Finaliza el splash y garantiza que el usuario llegue a la pantalla de bienvenida.
   *
   * Si la app quedo en `/`, se reemplaza la ruta por `/welcome`.
   * Se usa `replace` para no dejar la ruta vacia en el historial.
   */
  const finishSplash = useCallback(() => {
    setSplashDone(true);

    if (pathname === "/") {
      router.replace("/welcome");
    }
  }, [pathname, router]);

  /**
   * Respaldo de seguridad para evitar pantalla blanca.
   *
   * Si por alguna razon la animacion no ejecuta `onFinish` en web o Android,
   * este temporizador libera la app y envia al usuario a bienvenida.
   */
  useEffect(() => {
    if (splashDone) return;

    const timeout = setTimeout(finishSplash, 2600);

    return () => clearTimeout(timeout);
  }, [finishSplash, splashDone]);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SmartHomeProvider>
          {splashDone && (
            <Stack>
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

          {/* Capa visual inicial. Se desmonta cuando llama `finishSplash`. */}
          {!splashDone && <SplashAnimation onFinish={finishSplash} />}
        </SmartHomeProvider>

        {/* La barra de estado cambia cuando el splash desaparece. */}
        <StatusBar style={splashDone ? "auto" : "light"} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
