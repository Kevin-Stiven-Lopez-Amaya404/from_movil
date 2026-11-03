/**
 * Hook utilitario para seleccionar colores segun el modo claro/oscuro.
 *
 * Recibe un par de variantes opcionales y devuelve el valor segun el tema
 * actual del sistema. Esto es util para componentes que requieren colores
 * adaptativos pero no usan el tema global completo.
 */
import { useAppTheme } from "@/lib/theme/app-theme";

type ThemeColorName = "tint" | "icon" | "background" | "text";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ThemeColorName,
) {
  const theme = useAppTheme();
  const colorFromProps = props[theme.dark ? "dark" : "light"];

  if (colorFromProps) {
    return colorFromProps;
  }

  if (colorName === "tint") return theme.blue;
  if (colorName === "background") return theme.background;
  return colorName === "icon" ? theme.muted : theme.text;
}
