import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { width: "100%", alignSelf: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  headerCopy: { flex: 1 },
  brand: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.size.caption,
    fontWeight: "900",
    letterSpacing: 1.8,
    marginBottom: 13,
  },
  greeting: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.size.title,
    fontWeight: "900",
    lineHeight: 35,
  },
  greetingSubtitle: {
    fontSize: typography.size.helper,
    marginTop: 4,
  },
  headerSymbol: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  heroMedia: {
    height: 152,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 15,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.size.section,
    fontWeight: "900",
    marginTop: 28,
    marginBottom: 13,
  },
  navigationList: { gap: 11 },
  stateNote: { fontSize: typography.size.caption, lineHeight: 17, marginTop: 10 },
});
