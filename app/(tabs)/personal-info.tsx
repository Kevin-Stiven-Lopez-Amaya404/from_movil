import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


import { useSmartHome } from "@/lib/context/smart-home-context";
import { useTranslation } from "@/lib/i18n/i18n";
import {
  returnToParent,
  useAndroidBackFallback,
} from "@/lib/navigation/use-android-back-fallback";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../styles/(tabs)/personal-info.styles";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { t } = useTranslation();
  const { sessionEmail, sessionName, sessionRole } = useSmartHome();
  useAndroidBackFallback(from !== "profile", "/(tabs)/(main)/profile");

  const roleLabel =
    sessionRole === "admin"
      ? t("profile.roleAdmin")
      : sessionRole === "miembro"
        ? t("profile.roleMember")
        : t("profile.roleGuest");
  const name = sessionName.trim() || t("profile.dataUnavailable");
  const email = sessionEmail.trim() || t("profile.dataUnavailable");

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop,
          paddingBottom: layout.screenBottom,
        }}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("action.close")}
            onPress={() =>
              returnToParent(
                router,
                from,
                "profile",
                "/(tabs)/(main)/profile",
              )
            }
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: theme.rowAlt },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="close" size={21} color={theme.text} />
          </Pressable>

          <View style={styles.header}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: theme.rowAlt,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Text style={[styles.avatarText, { color: theme.blue }]}>
                {Array.from(name)[0]?.toUpperCase() ?? "?"}
              </Text>
            </View>
            <View style={styles.headerCopy}>
              <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
                {name}
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                {t("personal.subtitle")}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <View style={[styles.row, { borderBottomColor: theme.divider }]}>
              <View style={[styles.rowIcon, { backgroundColor: theme.rowAlt }]}>
                <Ionicons name="person-outline" size={18} color={theme.blue} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.label, { color: theme.muted }]}>
                  {t("personal.name")}
                </Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {name}
                </Text>
              </View>
            </View>

            <View style={[styles.row, { borderBottomColor: theme.divider }]}>
              <View style={[styles.rowIcon, { backgroundColor: theme.rowAlt }]}>
                <Ionicons name="mail-outline" size={18} color={theme.blue} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.label, { color: theme.muted }]}>
                  {t("personal.email")}
                </Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {email}
                </Text>
              </View>
            </View>

            <View style={[styles.row, { borderBottomColor: theme.divider }]}>
              <View style={[styles.rowIcon, { backgroundColor: theme.rowAlt }]}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={theme.blue}
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.label, { color: theme.muted }]}>
                  {t("personal.role")}
                </Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {roleLabel}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
