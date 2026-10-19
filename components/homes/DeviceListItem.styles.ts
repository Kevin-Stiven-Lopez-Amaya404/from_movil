import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const styles = StyleSheet.create({
  deviceCard: {
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  deviceContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  itemIconOff: {
    opacity: 0.5,
  },
  itemCopy: {
    flex: 1,
    marginLeft: 12,
  },
  deviceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemTitle: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 16,
    fontWeight: typography.weight.bold,
  },
  itemSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    marginTop: 2,
  },
  deviceAlertText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 11,
    marginTop: 3,
    fontWeight: typography.weight.bold,
  },
});
