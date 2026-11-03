import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const appFont = typography.fontFamily.emphasis;

export const styles = StyleSheet.create({
  section: {
    marginBottom: 15,
    width: "100%",
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 2,
  },

  sectionIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  sectionCopy: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    fontFamily: appFont,
    fontSize: typography.size.helper,
    fontWeight: "900",
  },

  sectionDescription: {
    fontFamily: appFont,
    fontSize: typography.size.caption,
    fontWeight: "600",
    lineHeight: 15,
    marginTop: 2,
  },

  menu: {
    borderRadius: 15,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 9,
  },
});
