import { typography } from "@/lib/theme/typography";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  listContainer: {
    alignItems: "center",
    flexGrow: 1,
  },

  content: {
    alignSelf: "center",
    width: "100%",
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },

  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    marginTop: 18,
    padding: 8,
  },

  summaryItem: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    minHeight: 86,
    justifyContent: "center",
    paddingHorizontal: 3,
  },

  summaryNumber: {
    fontSize: typography.size.section,
    fontWeight: "900",
    marginTop: 5,
  },

  summaryLabel: {
    fontSize: typography.size.caption,
    fontWeight: "700",
    marginTop: 1,
  },

  section: {
    marginTop: 24,
  },

  sectionHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: typography.size.section,
    fontWeight: "900",
    flexShrink: 1,
  },

  resultCount: {
    fontSize: typography.size.caption,
    fontWeight: "700",
    marginLeft: 8,
  },

  searchBox: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    paddingLeft: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: typography.size.helper,
    minHeight: 46,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  clearSearchButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  homeFilters: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 9,
  },

  homeFilter: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    maxWidth: 180,
    minHeight: 44,
    paddingHorizontal: 14,
  },

  homeFilterText: {
    fontSize: typography.size.caption,
    fontWeight: "800",
  },

  inlineStatePanel: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    minHeight: 68,
    padding: 14,
  },

  inlineStateCopy: {
    flex: 1,
    textAlign: "left",
  },

  statePanel: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    justifyContent: "center",
    marginBottom: 12,
    minHeight: 118,
    padding: 18,
  },

  statePanelTitle: {
    fontSize: typography.size.body,
    fontWeight: "800",
    textAlign: "center",
  },

  statePanelCopy: {
    fontSize: typography.size.caption,
    lineHeight: 18,
    textAlign: "center",
  },

  stateAction: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  deviceCard: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: "100%",
  },

  alertBorder: {
    borderWidth: 1.5,
  },

  deviceContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minHeight: 52,
    minWidth: 0,
  },

  deviceIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  deviceCopy: {
    flex: 1,
    gap: 3,
    marginLeft: 10,
    minWidth: 0,
  },

  deviceTitle: {
    fontSize: typography.size.helper,
    fontWeight: "900",
  },

  alertLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  alertText: {
    flexShrink: 1,
    fontSize: typography.size.caption,
    fontWeight: "800",
  },

  homeLabel: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 5,
  },

  deviceMeta: {
    fontSize: typography.size.caption,
    fontWeight: "600",
    flex: 1,
  },

  connectionLabel: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },

  deviceStatus: {
    fontSize: typography.size.caption,
    fontWeight: "800",
  },

  relayState: {
    fontSize: typography.size.caption,
    fontWeight: "700",
  },

  switchContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    minWidth: 54,
  },

  deviceLastSeen: {
    fontSize: typography.size.caption,
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.7,
  },
});
