import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 10,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 2,
  },

  pressed: {
    opacity: 0.7,
  },

  content: {
    alignItems: "center",
    flexDirection: "row",
  },

  iconContainer: {
    alignItems: "center",
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  info: {
    flex: 1,
    marginHorizontal: 12,
    minWidth: 0,
  },

  name: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 16,
    fontWeight: typography.weight.bold,
  },

  devices: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    marginTop: 3,
  },

  right: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },

  powerContainer: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  power: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 11,
    fontWeight: typography.weight.bold,
  },
});
