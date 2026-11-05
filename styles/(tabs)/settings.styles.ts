import { StyleSheet } from "react-native";

import { profileFont } from "@/components/profile/profileTheme";
import { typography } from "@/lib/theme/typography";

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    alignSelf: "center",
    gap: 16,
    width: "100%",
  },
  screenHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  backButton: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerCopy: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: profileFont,
    fontSize: typography.size.section,
    fontWeight: "900",
  },
  subtitle: {
    fontFamily: profileFont,
    fontSize: typography.size.caption,
    lineHeight: 18,
    marginTop: 3,
  },
  appearanceControls: {
    gap: 10,
    paddingVertical: 6,
  },
  currentValue: {
    fontFamily: profileFont,
    fontSize: typography.size.caption,
    fontWeight: "700",
  },
  syncCard: {
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  syncIcon: {
    alignItems: "center",
    borderRadius: 11,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  syncCopy: { flex: 1, minWidth: 0 },
  syncTitle: {
    fontFamily: profileFont,
    fontSize: typography.size.body,
    fontWeight: "800",
  },
  syncDescription: {
    fontFamily: profileFont,
    fontSize: typography.size.caption,
    lineHeight: 18,
    marginTop: 3,
  },
  pressed: { opacity: 0.72 },
});
