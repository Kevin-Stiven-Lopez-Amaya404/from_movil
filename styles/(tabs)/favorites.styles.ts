import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    alignItems: "center",
  },

  content: {
    alignSelf: "center",
    width: "100%",
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },

  backButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  headerCopy: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
  },

  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 3,
  },

  section: {
    marginTop: 24,
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "900",
  },

  countBadge: {
    alignItems: "center",
    borderRadius: 12,
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  countText: {
    fontSize: 12,
    fontWeight: "800",
  },

  favoriteCard: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 9,
    minHeight: 72,
    paddingLeft: 14,
    paddingRight: 6,
  },

  homeContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
    paddingVertical: 8,
  },

  iconContainer: {
    alignItems: "center",
    borderRadius: 12,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  cardCopy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
  },

  cardSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },

  starButton: {
    alignItems: "center",
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  chevronButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 32,
  },

  emptyCard: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    padding: 28,
  },

  emptyIconContainer: {
    alignItems: "center",
    borderRadius: 22,
    height: 64,
    justifyContent: "center",
    width: 64,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 12,
  },

  emptyDescription: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 5,
    textAlign: "center",
  },

  emptyAction: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 15,
    minHeight: 42,
    paddingHorizontal: 14,
  },

  emptyActionText: {
    fontSize: 13,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.7,
  },
});
