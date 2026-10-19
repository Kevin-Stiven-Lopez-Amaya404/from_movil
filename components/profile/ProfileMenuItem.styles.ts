import { StyleSheet } from "react-native";
import { profileFont, profileTheme } from "./profileTheme";

export const styles = StyleSheet.create({
  boxedRow: {
    alignItems: "center",
    backgroundColor: profileTheme.row,
    borderColor: profileTheme.divider,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    marginHorizontal: 4,
    marginVertical: 5,
    minHeight: 62,
    paddingHorizontal: 10,
  },
  copy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  dangerText: {
    color: profileTheme.danger,
  },
  description: {
    color: profileTheme.muted,
    fontFamily: profileFont,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  plainRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    minHeight: 54,
    paddingHorizontal: 10,
  },
  pressed: {
    opacity: 0.72,
  },
  title: {
    color: profileTheme.text,
    fontFamily: profileFont,
    fontSize: 16,
    fontWeight: "800",
  },
});
