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
  iconWrap: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    height: 60,
    justifyContent: "center",
    width: 60,
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
    padding: 18,
    paddingTop: 16,
  },
  sectionTitle: {
    fontFamily: profileFont,
    fontSize: typography.size.bodyLarge,
    fontWeight: "900",
    marginBottom: 10,
  },
  description: {
    fontFamily: profileFont,
    fontSize: typography.size.helper,
    lineHeight: 22,
    marginBottom: 18,
  },
  infoRow: {
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    marginTop: 12,
  },
  label: {
    fontFamily: profileFont,
    fontSize: typography.size.caption,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  value: {
    fontFamily: profileFont,
    fontSize: typography.size.helper,
    fontWeight: "800",
  },
  pressed: { opacity: 0.72 },
});
