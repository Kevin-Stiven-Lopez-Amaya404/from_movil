import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
  },
  kicker: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 11,
  },
  deviceHeadline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deviceIcon: {
    height: 49,
    width: 49,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceHeadingText: {
    flex: 1,
    gap: 5,
  },
  deviceName: {
    fontWeight: "800",
    fontSize: 16,
  },
  deviceStatus: {
    fontSize: 12,
  },
  errorSection: {
    marginTop: 15,
    gap: 7,
  },
  retryButton: {
    alignSelf: "flex-start",
    paddingVertical: 7,
  },
  divider: {
    marginTop: 27,
    marginBottom: 24,
    height: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
  },
  homeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  homeName: {
    fontSize: 15,
    fontWeight: "700",
  },
  nameInput: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 15,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  primaryButton: {
    marginTop: 25,
    minHeight: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  confirmation: {
    flexDirection: "row",
    gap: 10,
    marginTop: 17,
    alignItems: "flex-start",
  },
  pendingNote: {
    fontSize: 12,
    lineHeight: 19,
    marginTop: 27,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.75,
  },
});
