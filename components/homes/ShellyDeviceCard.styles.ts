import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  topStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusIcon: {
    opacity: 0.8,
  },
  criticalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  criticalText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
  },
  shellyThumb: {
    width: 52,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
  deviceModel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    marginTop: 2,
  },
  deviceStatus: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: typography.fontFamily.regular,
  },
  deviceActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  menuButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
    minWidth: 24,
  },
});
