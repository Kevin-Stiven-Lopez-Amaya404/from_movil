import { typography } from "@/lib/theme/typography";
import { StyleSheet } from "react-native";
import { profileFont } from "@/components/profile/profileTheme";

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { alignSelf: "center", width: "100%" },
  closeButton: {
    alignItems: "center",
    alignSelf: "flex-end",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    marginBottom: 18,
    width: 44,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 18,
  },
  avatar: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  avatarText: {
    fontFamily: profileFont,
    fontSize: typography.size.title,
    fontWeight: "900",
  },
  headerCopy: { flex: 1, marginLeft: 12 },
  title: {
    fontFamily: profileFont,
    fontSize: typography.size.section,
    fontWeight: "900",
  },
  subtitle: {
    fontFamily: profileFont,
    fontSize: typography.size.caption,
    marginTop: 2,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    paddingVertical: 6,
  },
  row: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  rowIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  rowContent: { flex: 1, marginLeft: 12 },
  label: {
    fontFamily: profileFont,
    fontSize: typography.size.caption,
    fontWeight: "700",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  value: {
    fontFamily: profileFont,
    fontSize: typography.size.body,
    fontWeight: "800",
  },
  pressed: { opacity: 0.72 },
});
