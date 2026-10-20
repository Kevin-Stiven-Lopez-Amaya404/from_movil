import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    alignItems: "center",
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

  backButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
  },

  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 3,
  },

  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 22,
    padding: 10,
  },

  summaryItem: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    minHeight: 88,
    justifyContent: "center",
  },

  summaryNumber: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 5,
  },

  summaryLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 12,
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
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  statePanelCopy: {
    fontSize: 12,
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

  stateActionText: {
    fontSize: 13,
    fontWeight: "800",
  },

  deviceCard: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    padding: 13,
  },

  alertBorder: {
    borderWidth: 1.5,
  },

  deviceContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
  },

  deviceIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    width: 48,
  },

  deviceCopy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  deviceTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },

  deviceTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
  },

  deviceMeta: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },

  deviceStatus: {
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },
  deviceLastSeen: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },

  pressed: {
    opacity: 0.7,
  },
});
