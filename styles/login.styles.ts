import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const styles = StyleSheet.create({
  // Columna completa: encabezado arriba, formulario, enlaces al final.
  screenContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    marginBottom: 16,
    marginLeft: -10, // alinea la flecha con el borde del texto
  },
  introSection: {
    gap: 8,
    marginBottom: 32,
  },
  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
  },
  titleTiny: {
    fontSize: typography.size.title,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  formContainer: {
    gap: 20,
    width: "100%",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
    fontWeight: "400",
    minHeight: 52,
    paddingHorizontal: 16,
  },
  optionsRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  forgotButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 4,
  },
  linkText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
    fontWeight: "600",
  },
  formError: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  formErrorText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    borderRadius: 12,
    minHeight: 52,
  },
  footer: {
    alignItems: "center",
    gap: 4,
    marginTop: 16,
  },
  footerLink: {
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 8,
  },
  registerRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
  footerText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    textAlign: "center",
  },
});
