import { useWindowDimensions } from "react-native";

export function useResponsiveLayout() {
  const { height, width } = useWindowDimensions();
  const tiny = width < 340 || height < 620;
  const short = height < 700;
  const narrow = width < 380;
  const compact = tiny || short || narrow;
  const gutter = tiny ? 12 : narrow ? 16 : 22;
  const maxWidth = Math.min(Math.max(width - gutter * 2, 0), 420);

  return {
    compact,
    contentWidth: maxWidth,
    gutter,
    narrow,
    short,
    tiny,
    topSpace: compact ? 28 : 54,
    width,
  };
}
