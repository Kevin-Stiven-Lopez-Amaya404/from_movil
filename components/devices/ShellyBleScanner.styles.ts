import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  description: {
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 16,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: "center",
    padding: 12,
  },
  message: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 14,
    gap: 10,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontWeight: "800",
    fontSize: 13,
  },
  deviceMeta: {
    fontSize: 11,
    marginTop: 4,
  },
  inspectButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});
