import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet } from "react-native";

import { useAuthPalette } from "@/lib/theme/appearance";

type BackButtonProps = {
  /** Color del icono. Permite adaptarlo a pantallas claras u oscuras. */
  color?: string;
  /** Ruta segura a la que se navega si no existe historial para volver. */
  fallbackHref: Href;
  accessibilityLabel?: string;
  backgroundColor?: string;
  disabled?: boolean;
  onPress?: () => void;
};

/**
 * Botón reutilizable para volver desde una pantalla.
 *
 * En movil intenta usar `router.back()` cuando existe historial.
 * En web o cuando no hay historial confiable, usa `router.replace(fallbackHref)`
 * para enviar al usuario a una ruta segura.
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
   * Usa el historial cuando es posible y una ruta segura como fallback.
   * Esta proteccion evita pantallas sin salida cuando el usuario entra directo por URL.
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
