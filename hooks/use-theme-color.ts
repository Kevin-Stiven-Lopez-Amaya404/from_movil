/**
 * Hook utilitario para seleccionar colores segun el modo claro/oscuro.
 *
 * Recibe un par de variantes opcionales y devuelve el valor segun el tema
 * actual del sistema. Esto es util para componentes que requieren colores
 * adaptativos pero no usan el tema global completo.
 */
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
