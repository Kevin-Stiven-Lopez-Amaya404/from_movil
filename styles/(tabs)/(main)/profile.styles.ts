import { typography } from "@/lib/theme/typography";
import { StyleSheet } from "react-native";
import { profileFont } from "@/components/profile/profileTheme";

export const appFont = profileFont;

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    alignSelf: "center",
    gap: 2,
    width: "100%",
  },
  identity: {
    alignItems: "center",
    paddingBottom: 20,
    paddingTop: 2,
  },
  avatar: {
    alignItems: "center",
    borderRadius: 44,
    borderWidth: 1,
    height: 88,
    justifyContent: "center",
    width: 88,
  },
  avatarText: {
    fontFamily: appFont,
    fontSize: typography.size.title,
    fontWeight: "900",
  },
  identityName: {
    fontFamily: appFont,
    fontSize: typography.size.title,
    fontWeight: "900",
    marginTop: 12,
    maxWidth: "100%",
    textAlign: "center",
  },
  identityEmail: {
    fontFamily: appFont,
    fontSize: typography.size.body,
    marginTop: 4,
    maxWidth: "100%",
    textAlign: "center",
  },
  identityRole: {
    fontFamily: appFont,
    fontSize: typography.size.caption,
    fontWeight: "700",
    marginTop: 6,
  },
  logoutArea: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 3,
    paddingTop: 15,
  },
  logout: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logoutText: {
    fontFamily: appFont,
    fontSize: typography.size.helper,
    fontWeight: "900",
    marginLeft: 8,
  },
  pressed: { opacity: 0.72 },
});
