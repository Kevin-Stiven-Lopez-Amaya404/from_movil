import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet } from "react-native";

import { useAuthPalette } from "@/lib/theme/appearance";

type BackButtonProps = {
  /** Color del icono. Permite adaptarlo a pantallas claras u oscuras. */
  color?: string;
  /** Ruta segura a la que se navega si no existe historial para volver. */
  fallbackHref: Href;
};

/**
 * Boton reutilizable para cerrar una pantalla.
 *
 * En movil intenta usar `router.back()` cuando existe historial.
 * En web o cuando no hay historial confiable, usa `router.replace(fallbackHref)`
 * para enviar al usuario a una ruta segura.
 */
export function BackButton({ color, fallbackHref }: BackButtonProps) {
  const router = useRouter();
  const palette = useAuthPalette();

  /**
   * Decide entre volver en el historial o reemplazar por una ruta fallback.
   * Esta proteccion evita pantallas sin salida cuando el usuario entra directo por URL.
   */
  function handlePress() {
    if (Platform.OS !== "web" && router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHref);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Cerrar"
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.primarySoft },
        pressed && styles.buttonPressed,
      ]}
    >
      <Ionicons name="close" size={21} color={color ?? palette.link} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  buttonPressed: {
    opacity: 0.65,
  },
});
