import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    width: "100%",
  },

  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  brandContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },

  brandIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  brandTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 20,
    fontWeight: typography.weight.bold,
  },

  actions: {
    flexDirection: "row",
    gap: 8,
  },

  actionButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    position: "relative",
    width: 40,
  },

  notificationDot: {
    borderRadius: 4,
    height: 8,
    position: "absolute",
    right: 9,
    top: 8,
    width: 8,
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  greetingContainer: {
    marginTop: 24,
  },

  greeting: {
    fontFamily: typography.fontFamily.display,
    fontSize: 28,
    fontWeight: typography.weight.heavy,
  },

  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    fontWeight: typography.weight.medium,
    marginTop: 4,
  },
});
