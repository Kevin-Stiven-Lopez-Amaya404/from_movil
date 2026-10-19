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
    marginBottom: 26,
    minHeight: 46,
  },
  headerSpacer: {
    height: 42,
    width: 42,
  },
  introSection: {
    alignItems: "center",
    gap: 7,
    marginBottom: 25,
  },
  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 39,
    textAlign: "center",
  },
  titleTiny: {
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  formContainer: {
    gap: 17,
    width: "100%",
  },
  fieldGroup: {
    gap: 7,
    width: "100%",
  },
  fieldLabel: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 2,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    fontWeight: "500",
    minHeight: 56,
    paddingHorizontal: 16,
  },
  optionsRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -5,
    width: "100%",
  },
  rememberContainer: {
    flex: 1,
  },
  forgotButton: {
    alignItems: "flex-end",
    maxWidth: "58%",
    paddingLeft: 8,
    paddingVertical: 7,
  },
  forgotText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },
  reactivationLink: {
    alignSelf: "center",
    marginTop: -4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  reactivationLinkText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    textAlign: "center",
  },
  registerRow: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    justifyContent: "center",
    marginTop: 1,
    paddingVertical: 5,
  },
  registerText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    fontWeight: "500",
  },
  registerLink: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
    fontWeight: "800",
  },
});
