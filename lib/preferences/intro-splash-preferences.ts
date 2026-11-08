import * as SecureStore from "expo-secure-store";

/**
 * Remembers whether the user already saw the welcome animation.
 *
 * The animation is shown only once per installation. Afterwards, the app
 * starts with the native splash and goes straight to the right screen.
 */
const INTRO_SPLASH_KEY = "smart-home.intro-splash-seen";

export async function hasSeenIntroSplash(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(INTRO_SPLASH_KEY)) === "1";
  } catch {
    // If storage fails, it is better not to repeat the animation.
    return true;
  }
}

export async function markIntroSplashSeen(): Promise<void> {
  try {
    await SecureStore.setItemAsync(INTRO_SPLASH_KEY, "1");
  } catch {
    // Without persistence the animation could repeat; it does not block startup.
  }
}