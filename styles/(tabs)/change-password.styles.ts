import { typography } from "@/lib/theme/typography";
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
    overflow: "hidden",
    padding: 16,
    paddingTop: 18,
  },
  input: {
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 17,
    fontFamily: profileFont,
    fontSize: typography.size.body,
    fontWeight: "500",
    height: 56,
    paddingHorizontal: 18,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 12,
  },
  strengthContainer: {
    borderRadius: 999,
    height: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  strengthBar: {
    borderRadius: 999,
    height: "100%",
  },
  button: {
    marginTop: 8,
  },
  pressed: { opacity: 0.72 },
});
