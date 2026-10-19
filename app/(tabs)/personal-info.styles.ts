import { StyleSheet } from "react-native";
import { profileFont } from "@/components/profile/profileTheme";

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { alignSelf: "center", width: "100%" },
  closeButton: {
    alignItems: "center",
    alignSelf: "flex-end",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    marginBottom: 18,
    width: 40,
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
    fontSize: 26,
    fontWeight: "900",
  },
  headerCopy: { flex: 1, marginLeft: 12 },
  title: {
    fontFamily: profileFont,
    fontSize: 20,
    fontWeight: "900",
  },
  subtitle: {
    fontFamily: profileFont,
    fontSize: 12,
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
    borderBottomColor: "rgba(148,163,184,0.25)",
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
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  value: {
    fontFamily: profileFont,
    fontSize: 16,
    fontWeight: "800",
  },
  pressed: { opacity: 0.72 },
});
