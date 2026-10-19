import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const appFont = typography.fontFamily.emphasis;

export const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    width: "100%",
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 9,
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
    fontSize: 16,
    fontWeight: "900",
  },

  sectionDescription: {
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
    marginTop: 2,
  },

  menu: {
    borderRadius: 16,
    gap: 7,
    padding: 4,
  },
});
