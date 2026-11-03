import { typography } from "@/lib/theme/typography";
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
    fontSize: typography.size.section,
    fontWeight: "900",
  },
  kicker: {
    fontSize: typography.size.caption,
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
    fontSize: typography.size.body,
  },
  deviceStatus: {
    fontSize: typography.size.caption,
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
    fontSize: typography.size.helper,
    fontWeight: "700",
  },
  homeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  homeName: {
    fontSize: typography.size.body,
    fontWeight: "700",
  },
  nameInput: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    fontSize: typography.size.body,
  },
  helperText: {
    fontSize: typography.size.caption,
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
    fontSize: typography.size.helper,
    fontWeight: "800",
  },
  confirmation: {
    flexDirection: "row",
    gap: 10,
    marginTop: 17,
    alignItems: "flex-start",
  },
  pendingNote: {
    fontSize: typography.size.caption,
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
