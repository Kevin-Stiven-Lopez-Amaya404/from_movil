import { typography } from "@/lib/theme/typography";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  title: {
    fontSize: typography.size.body,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: typography.size.caption,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  action: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 13,
    minHeight: 64,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    gap: 8,
  },
  actionCopy: {
    flex: 1,
    minWidth: 0,
  },
  actionTitle: {
    fontSize: typography.size.helper,
    fontWeight: "800",
  },
  actionDescription: {
    fontSize: typography.size.caption,
    marginTop: 3,
  },
  note: {
    fontSize: typography.size.caption,
    lineHeight: 17,
    marginTop: 10,
  },
});
