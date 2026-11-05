import { StyleSheet } from "react-native";

import { typography } from "@/lib/theme/typography";

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    alignSelf: "center",
    gap: 18,
    width: "100%",
  },
  header: { marginBottom: 4 },
  documentTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.size.section,
    fontWeight: "800",
    lineHeight: 27,
  },
  documentSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.body,
    lineHeight: 23,
  },
  version: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: typography.size.caption,
    fontWeight: "700",
    lineHeight: 18,
  },
  status: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: typography.size.helper,
    fontWeight: "700",
    lineHeight: 20,
  },
  section: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 9,
    paddingBottom: 17,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.size.bodyLarge,
    fontWeight: "800",
    lineHeight: 25,
  },
  paragraph: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.body,
    lineHeight: 24,
  },
});
