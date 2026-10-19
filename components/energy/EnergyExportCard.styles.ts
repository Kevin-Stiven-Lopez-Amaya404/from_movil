import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 12,
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
    fontSize: 13,
    fontWeight: "800",
  },
  actionDescription: {
    fontSize: 10,
    marginTop: 3,
  },
  note: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
  },
});
