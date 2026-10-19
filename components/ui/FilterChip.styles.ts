import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    elevation: 0,
    justifyContent: "center",
    minWidth: 92,
    paddingHorizontal: 14,
    position: "relative",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 6,
  },
  equalWidthChip: {
    alignSelf: "stretch",
    minWidth: 0,
    width: "100%",
  },
  selectedChip: {
    elevation: 2,
    shadowOpacity: 0.12,
  },
  focusedChip: {
    borderWidth: 2,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    maxWidth: "100%",
  },
  icon: {
    marginRight: 8,
  },
  label: {
    textAlign: "center",
  },
  selectionIndicator: {
    borderRadius: 2,
    bottom: 5,
    height: 3,
    position: "absolute",
    width: 22,
  },
});
