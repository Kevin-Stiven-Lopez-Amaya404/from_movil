import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet } from "react-native";

import { useAuthPalette } from "@/lib/theme/appearance";

type BackButtonProps = {
  /** Icon color. Lets it adapt to light or dark screens. */
  color?: string;
  /** Safe route to navigate to when there is no history to go back. */
  fallbackHref: Href;
  accessibilityLabel?: string;
  backgroundColor?: string;
  disabled?: boolean;
  onPress?: () => void;
};

/**
 * Reusable button to go back from a screen.
 *
 * On mobile it tries `router.back()` when there is history.
 * On web, or when there is no reliable history, it uses `router.replace(fallbackHref)`
 * to send the user to a safe route.
 */
export function BackButton({
  accessibilityLabel = "Volver",
  backgroundColor,
  color,
  disabled = false,
  fallbackHref,
  onPress,
}: BackButtonProps) {
  const router = useRouter();
  const palette = useAuthPalette();

  /**
   * Uses the history when possible and a safe route as a fallback.
   * This protection avoids dead-end screens when the user enters directly by URL.
   */
  function handlePress() {
    if (onPress) {
      onPress();
      return;
    }

    if (Platform.OS !== "web" && router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHref);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: backgroundColor ?? palette.primarySoft },
        disabled && styles.disabled,
        pressed && styles.buttonPressed,
      ]}
    >
      <Ionicons name="chevron-back" size={24} color={color ?? palette.link} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  buttonPressed: {
    opacity: 0.65,
  },
  disabled: {
    opacity: 0.5,
  },
});
