import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    minHeight: 156,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  iconContainer: {
    alignItems: "center",
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    fontWeight: typography.weight.medium,
    marginTop: 16,
  },

  value: {
    fontFamily: typography.fontFamily.display,
    fontSize: 28,
    fontWeight: typography.weight.heavy,
    marginTop: 2,
  },

  comparison: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 11,
    fontWeight: typography.weight.bold,
    marginTop: 4,
  },
});
