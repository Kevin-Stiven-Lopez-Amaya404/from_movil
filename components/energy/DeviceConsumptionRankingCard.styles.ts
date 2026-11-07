import { typography } from "@/lib/theme/typography";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 12,
  },
  title: {
    fontSize: typography.size.body,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: typography.size.caption,
    marginTop: 5,
  },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  device: {
    marginBottom: 17,
  },
  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 9,
  },
  deviceName: {
    flex: 1,
    fontSize: typography.size.helper,
    fontWeight: "600",
  },
  deviceEnergy: {
    fontSize: typography.size.caption,
    fontWeight: "800",
  },
  track: {
    height: 8,
    borderRadius: 99,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    borderRadius: 99,
  },
});
