import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const BAR_HORIZONTAL_PADDING = 8;
export const BAR_HEIGHT = 72;

export const styles = StyleSheet.create({
  safeArea: {
    alignItems: "center",
    width: "100%",
  },
  bar: {
    alignItems: "stretch",
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: BAR_HEIGHT,
    maxWidth: 520,
    paddingHorizontal: BAR_HORIZONTAL_PADDING,
    position: "relative",
    elevation: 10,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    width: "90%",
  },
  item: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 2,
    paddingVertical: 4,
    zIndex: 1,
  },
  pressed: {
    opacity: 0.68,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    height: 29,
    position: "relative",
  },
  badge: {
    alignItems: "center",
    backgroundColor: "#FF4D4F",
    borderRadius: 999,
    justifyContent: "center",
    minWidth: 18,
    paddingHorizontal: 5,
    paddingVertical: 2,
    position: "absolute",
    right: -8,
    top: -4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 9,
    fontWeight: "800",
  },
  activeIndicator: {
    borderRadius: 24,
    bottom: 7,
    position: "absolute",
    zIndex: 0,
  },
  label: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    marginTop: 2,
  },
});
