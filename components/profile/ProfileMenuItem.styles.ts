import { StyleSheet } from "react-native";
import { profileFont } from "./profileTheme";

export const styles = StyleSheet.create({
  boxedRow: {
    alignItems: "center",
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
  description: {
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
    fontFamily: profileFont,
    fontSize: 16,
    fontWeight: "800",
  },
});
