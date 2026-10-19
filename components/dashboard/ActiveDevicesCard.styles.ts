import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 2,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: 19,
    fontWeight: typography.weight.bold,
  },

  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    marginTop: 3,
  },

  viewButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
    paddingVertical: 5,
  },

  viewText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: typography.weight.bold,
  },

  list: {
    width: "100%",
  },

  device: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 68,
    paddingVertical: 9,
  },

  deviceIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  deviceInfo: {
    flex: 1,
    marginHorizontal: 10,
    minWidth: 0,
  },

  deviceName: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
    fontWeight: typography.weight.bold,
  },

  deviceRoom: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    marginTop: 2,
  },

  deviceRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },

  activeDot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },

  power: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: typography.weight.bold,
  },

  empty: {
    alignItems: "center",
    paddingVertical: 24,
  },

  emptyIcon: {
    alignItems: "center",
    borderRadius: 20,
    height: 48,
    justifyContent: "center",
    width: 48,
  },

  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    marginTop: 8,
  },

  pressed: {
    opacity: 0.7,
  },
});
