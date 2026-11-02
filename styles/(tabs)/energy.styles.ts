import { StyleSheet } from "react-native";

import { typography } from "@/lib/theme/typography";

/** Estilos compartidos por la tarjeta y las pantallas de energia SQL034. */
export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  headerTexts: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    fontFamily: typography.fontFamily.emphasis,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    borderRadius: 17,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 6,
  },
  monthButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: "700",
  
  },
  label: {
    fontSize: 13,
    marginTop: 12,
  },
  bigValue: {
    fontSize: 28,
    fontWeight: "900",
    marginTop: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  note: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 17,
  },
  warningBox: {
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginTop: 14,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  listItem: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    marginTop: 6,
  },
  fieldError: {
    fontSize: 12,
    marginTop: 4,
  },
  centerBox: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
});
