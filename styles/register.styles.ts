import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const styles = StyleSheet.create({
  screenContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 21,
    minHeight: 42,
  },
  headerSpacer: {
    height: 40,
    width: 40,
  },
  introSection: {
    alignItems: "center",
    gap: 6,
    marginBottom: 21,
  },
  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: 31,
    fontWeight: "800",
    lineHeight: 38,
  },
  titleTiny: {
    fontSize: 27,
    lineHeight: 33,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    lineHeight: 21,
  },
  formContainer: {
    gap: 14,
    width: "100%",
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    fontWeight: "500",
    minHeight: 54,
    paddingHorizontal: 15,
  },
  passwordGuidance: {
    borderRadius: 13,
    borderWidth: 1,
    marginTop: 9,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  strengthHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  strengthTitle: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 11,
    fontWeight: "700",
  },
  strengthLabel: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 11,
    fontWeight: "800",
  },
  strengthTrack: {
    borderRadius: 3,
    height: 5,
    overflow: "hidden",
  },
  strengthBar: {
    borderRadius: 3,
    height: "100%",
  },
  ruleGrid: {
    columnGap: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    rowGap: 6,
  },
  ruleItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    width: "48%",
  },
  ruleText: {
    flexShrink: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
  },
  termsText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  termsError: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
    marginTop: 5,
  },
  button: {
    marginTop: 2,
    minHeight: 56,
  },
  loginRow: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingVertical: 5,
  },
  loginText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    fontWeight: "500",
  },
  loginLink: {
    fontFamily: typography.fontFamily.emphasis,
    fontWeight: "800",
  },
});
