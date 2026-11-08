import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Central hook to adapt screens to different phones.
 *
 * Combines:
 * - Real screen size (`useWindowDimensions`).
 * - Device safe margins (`useSafeAreaInsets`).
 *
 * That way screens do not repeat calculations and elements do not end up
 * off-screen on Android, iPhone, notch or bottom bar.
 */
export function useResponsiveLayout() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Simple classifications to adjust typography, spacing and element height.
  const tiny = width < 340 || height < 620;
  const short = height < 700;
  const narrow = width < 380;
  const compact = tiny || short || narrow;

  // Dynamic side margin: less space on small screens.
  const gutter = tiny ? 12 : narrow ? 16 : 22;

  // Limits the width so content does not stretch too much on web/tablet.
  const maxWidth = Math.min(Math.max(width - gutter * 2, 0), 420);

  // Real safe areas of the device.
  const safeBottom = Math.max(insets.bottom, 12);
  const safeTop = Math.max(insets.top, 0);

  // SafeAreaView already applies the insets; these values are only visual spacing.
  const screenTop = compact ? 10 : 16;
  const screenBottom = 16;

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
