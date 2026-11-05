import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const styles = StyleSheet.create({
  screenContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
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
    fontSize: typography.size.screenTitle,
    fontWeight: "800",
    lineHeight: 38,
  },
  titleTiny: {
    fontSize: typography.size.title,
    lineHeight: 33,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.body,
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
    fontSize: typography.size.body,
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
    fontSize: typography.size.caption,
    fontWeight: "700",
  },
  strengthLabel: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: typography.size.caption,
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
    fontSize: typography.size.caption,
    lineHeight: 14,
  },
  termsText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: typography.size.helper,
    fontWeight: "600",
    lineHeight: 19,
  },
  termsError: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: typography.size.caption,
    fontWeight: "600",
    marginLeft: 8,
    marginTop: 5,
  },
  termsSectionHeading: {
    gap: 4,
    marginBottom: 8,
  },
  termsSectionTitle: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: typography.size.bodyLarge,
    fontWeight: "800",
    lineHeight: 23,
  },
  termsSectionHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.helper,
    lineHeight: 19,
  },
  termsDocumentButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    marginTop: 8,
    minHeight: 56,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  termsInlineContent: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 18,
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  termsDocumentCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  termsDocumentTitle: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: typography.size.body,
    fontWeight: "800",
  },
  termsDocumentHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.helper,
    lineHeight: 19,
  },
  termsDocumentPressed: {
    opacity: 0.72,
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
    fontSize: typography.size.helper,
    fontWeight: "500",
  },
  loginLink: {
    fontFamily: typography.fontFamily.emphasis,
    fontWeight: "800",
  },
});
