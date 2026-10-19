import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    marginTop: 4,
  },
  onlineBadge: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  onlineDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  onlineText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: "700",
  },
  gaugeArea: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  gaugeValue: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  value: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 42,
    fontWeight: "800",
    marginTop: 2,
  },
  unit: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 17,
    fontWeight: "700",
    marginTop: -4,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
  },
  statusText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
  },
});
