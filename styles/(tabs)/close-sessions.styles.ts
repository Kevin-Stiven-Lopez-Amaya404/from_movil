import { StyleSheet } from "react-native";
import { profileFont } from "@/components/profile/profileTheme";

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  content: { alignSelf: "center", width: "100%" },
  closeButton: {
    alignSelf: "flex-start",
    marginBottom: 38,
    paddingVertical: 3,
  },
  title: {
    fontFamily: profileFont,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 36,
  },
  description: {
    fontFamily: profileFont,
    fontSize: 17,
    lineHeight: 25,
    marginTop: 14,
  },
  infoCard: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
    padding: 18,
  },
  infoText: {
    flex: 1,
    fontFamily: profileFont,
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 32,
    paddingVertical: 18,
    position: "absolute",
    right: 0,
  },
  submitButton: {
    alignItems: "center",
    borderRadius: 32,
    minHeight: 56,
    justifyContent: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontFamily: profileFont,
    fontSize: 17,
    fontWeight: "800",
  },
  pressed: { opacity: 0.7 },
});
