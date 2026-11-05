import { Platform } from "react-native";

/**
 * Tipografia central de Smart Home.
 *
 * Usa fuentes nativas para evitar instalar librerias extra:
 * - iOS: San Francisco mediante `System`.
 * - Android: Roboto mediante `sans-serif`.
 * - Web: Arial como fallback estable.
 */
export const typography = {
  fontFamily: {
    regular:
      Platform.select({
        ios: "System",
        android: "sans-serif",
        default: "Arial",
      }) ?? "System",
    emphasis:
      Platform.select({
        ios: "System",
        android: "sans-serif-medium",
        default: "Arial",
      }) ?? "System",
    display:
      Platform.select({
        ios: "System",
        android: "sans-serif-medium",
        default: "Arial",
      }) ?? "System",
  },
  size: {
    caption: 12,
    helper: 13,
    body: 15,
    bodyLarge: 17,
    section: 20,
    title: 26,
    screenTitle: 32,
    brand: 42,
  },
  weight: {
    regular: "400",
    medium: "600",
    semibold: "700",
    bold: "800",
    heavy: "900",
  },
} as const;
