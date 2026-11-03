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
    justifyContent: "space-between",
    marginBottom: 13,
    minHeight: 44,
  },
  title: {
    flex: 1,
    fontSize: typography.size.section,
    fontWeight: "900",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  homeLabel: {
    fontSize: typography.size.helper,
    fontWeight: "700",
    marginTop: 6,
  },
  description: {
    fontSize: typography.size.helper,
    lineHeight: 21,
    marginTop: 12,
  },
  primaryButton: {
    marginTop: 22,
    borderRadius: 12,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    fontWeight: "800",
    fontSize: typography.size.helper,
  },
  resultsSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: typography.size.body,
    fontWeight: "800",
    marginBottom: 5,
  },
  message: {
    fontSize: typography.size.helper,
    lineHeight: 19,
    marginTop: 14,
  },
  deviceRow: {
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  deviceIcon: {
    height: 42,
    width: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceContent: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  deviceName: {
    fontSize: typography.size.helper,
    fontWeight: "800",
  },
  deviceCaption: {
    fontSize: typography.size.caption,
    lineHeight: 17,
  },
  selectButton: {
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  retryButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.76,
  },
});
