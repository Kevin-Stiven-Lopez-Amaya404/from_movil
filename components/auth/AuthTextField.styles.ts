import { StyleSheet } from "react-native";
import { theme } from "@/constants/theme";
import { typography } from "@/lib/theme/typography";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  input: {
    backgroundColor: "#FBFBFD",
    borderColor: "transparent",
    borderRadius: 16,
    borderWidth: 1,

    color: "#3F3F3F",

    fontFamily: typography.fontFamily.emphasis,
    fontSize: 16,
    fontWeight: "700",

    minHeight: 52,

    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  inputDisabled: {
    opacity: 0.7,
  },

  inputError: {
    borderColor: theme.colors.error,
  },

  label: {
    color: theme.colors.textDark,

    fontFamily: typography.fontFamily.emphasis,
    fontSize: 13,
    fontWeight: "800",

    marginBottom: 7,
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
    color: theme.colors.error,

    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: "700",

    marginLeft: 4,
    marginTop: 5,
  },
});
