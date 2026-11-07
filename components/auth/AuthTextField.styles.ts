import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  input: {
    borderColor: "transparent",
    borderRadius: 16,
    borderWidth: 1,

    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
    fontWeight: "400",

    minHeight: 52,

    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  inputDisabled: {
    opacity: 0.7,
  },

  inputError: {
    borderColor: "transparent",
  },

  label: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
    fontWeight: "600",

    marginBottom: 8,
    marginLeft: 2,
  },

  passwordInput: {
    paddingRight: 52,
  },

  passwordWrap: {
    position: "relative",
    width: "100%",
  },

  eyeButton: {
    position: "absolute",
    right: 10,
    top: 0,

    width: 40,
    height: 52,

    alignItems: "center",
    justifyContent: "center",
  },

  errorText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 13,
    fontWeight: "500",

    marginLeft: 2,
    marginTop: 6,
  },
});