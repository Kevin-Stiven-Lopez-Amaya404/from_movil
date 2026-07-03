import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Hook centralizado para adaptar las pantallas a distintos celulares.
 *
 * Combina:
 * - Tamano real de pantalla (`useWindowDimensions`).
 * - Margenes seguros del dispositivo (`useSafeAreaInsets`).
 *
 * Asi las pantallas no repiten calculos y se evitan elementos por fuera de la
 * pantalla en Android, iPhone, notch o barra inferior.
 */
export function useResponsiveLayout() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Clasificaciones simples para ajustar tipografia, espacios y alto de elementos.
  const tiny = width < 340 || height < 620;
  const short = height < 700;
  const narrow = width < 380;
  const compact = tiny || short || narrow;

  // Margen lateral dinamico: menos espacio en pantallas pequenas.
  const gutter = tiny ? 12 : narrow ? 16 : 22;

  // Limita el ancho para que en web/tablet el contenido no se estire demasiado.
  const maxWidth = Math.min(Math.max(width - gutter * 2, 0), 420);

  // Safe areas reales del dispositivo.
  const safeBottom = Math.max(insets.bottom, 12);
  const safeTop = Math.max(insets.top, 0);

  // Espacios finales usados por pantallas con ScrollView y tabbar.
  const screenTop = safeTop + (compact ? 10 : 16);
  const screenBottom = safeBottom + 92;

  return {
    compact,
    contentWidth: maxWidth,
    gutter,
    insets,
    narrow,
    safeBottom,
    safeTop,
    screenBottom,
    screenTop,
    short,
    tiny,
    topSpace: safeTop + (compact ? 28 : 54),
    width,
  };
}
