import * as SecureStore from "expo-secure-store";

/**
 * Recuerda si el usuario ya vio la animación de bienvenida.
 *
 * La animación se muestra una sola vez por instalación. Después, la app
 * arranca con el splash nativo y pasa directo a la pantalla correspondiente.
 */
const INTRO_SPLASH_KEY = "smart-home.intro-splash-seen";

export async function hasSeenIntroSplash(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(INTRO_SPLASH_KEY)) === "1";
  } catch {
    // Si el almacenamiento falla, es preferible no repetir la animación.
    return true;
  }
}

export async function markIntroSplashSeen(): Promise<void> {
  try {
    await SecureStore.setItemAsync(INTRO_SPLASH_KEY, "1");
  } catch {
    // Sin persistencia la animación podría repetirse; no bloquea el arranque.
  }
}