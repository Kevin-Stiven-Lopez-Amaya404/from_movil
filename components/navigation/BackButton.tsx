import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet, Text } from "react-native";

type BackButtonProps = {
  /** Color del icono y texto. Permite adaptarlo a pantallas claras u oscuras. */
  color?: string;
  /** Ruta segura a la que se navega si no existe historial para volver. */
  fallbackHref: Href;
  /** Texto visible y etiqueta accesible del boton. */
  label?: string;
};

/**
 * Boton reutilizable para volver.
 *
 * En movil intenta usar `router.back()` cuando existe historial.
 * En web o cuando no hay historial confiable, usa `router.replace(fallbackHref)`
 * para enviar al usuario a una ruta segura.
 */
export function BackButton({ color = "#0864C8", fallbackHref, label = "Volver" }: BackButtonProps) {
  const router = useRouter();

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
      accessibilityLabel={label}
      onPress={handlePress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <Ionicons name="chevron-back" size={22} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 4,
    minHeight: 36,
    paddingRight: 10,
  },
  buttonPressed: {
    opacity: 0.65,
  },
  label: {
    fontSize: 15,
    fontWeight: "800",
  },
});
