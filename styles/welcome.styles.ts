import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    flexGrow: 1,
    paddingBottom: 24,
  },
  // Columna completa: el bloque principal se centra en el espacio libre
  // y los botones quedan abajo, en la zona del pulgar.
  content: {
    flex: 1,
    justifyContent: "space-between",
    width: "100%",
  },
  hero: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingVertical: 24,
  },

  // Casa
  houseTile: {
    alignItems: "center",
    borderRadius: 32,
    height: 128,
    justifyContent: "center",
    marginBottom: 32,
    width: 128,
  },
  houseTileCompact: {
    borderRadius: 28,
    height: 108,
    marginBottom: 24,
    width: 108,
  },
  boltAnchor: {
    alignItems: "center",
    bottom: 14,
    height: 32,
    justifyContent: "center",
    position: "absolute",
    right: 14,
    width: 32,
  },
  boltPulse: {
    borderRadius: 16,
    height: 32,
    position: "absolute",
    width: 32,
  },
  boltBadge: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 3,
    height: 32,
    justifyContent: "center",
    width: 32,
  },

  // Textos
  brand: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: typography.size.caption,
    fontWeight: "600",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 36,
    maxWidth: 320,
    textAlign: "center",
  },
  titleTiny: {
    fontSize: typography.size.title,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    maxWidth: 320,
    textAlign: "center",
  },

  // Acciones
  actions: {
    alignSelf: "center",
    gap: 12,
    maxWidth: 400,
    width: "100%",
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 16,
    fontWeight: "600",
  },
});