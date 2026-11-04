import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthSession } from "@/lib/auth/auth-session-context";
import { useTranslation } from "@/lib/i18n/i18n";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

export default function NotFoundScreen() {
  const { isAuthenticated } = useAuthSession();
  const theme = useAppTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
        {t("route.notFoundTitle")}
      </Text>

      <Text style={[styles.message, { color: theme.muted }]}>
        {t("route.notFoundBody")}
      </Text>

      <Link
        href={isAuthenticated ? "/" : "/welcome"}
        asChild
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("route.home")}
          style={({ pressed }) => [
            styles.homeAction,
            { backgroundColor: theme.rowAlt },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="home-outline" size={21} color={theme.blue} />
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    fontSize: typography.size.section,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    fontSize: typography.size.body,
    textAlign: "center",
  },
  homeAction: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    marginTop: 12,
    width: 44,
  },
  pressed: { opacity: 0.65 },
});
