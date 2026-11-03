import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileMenuItem } from "@/components/profile/ProfileMenuItem";
import { ProfileShortcutCard } from "@/components/profile/ProfileShortcutCard";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { useAuthSession } from "@/lib/auth/auth-session-context";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useTranslation } from "@/lib/i18n/i18n";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { runSingleFlight } from "@/lib/utils/async-action-lock";
import { styles } from "../../../styles/(tabs)/(main)/profile.styles";

export default function ProfileScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { t } = useTranslation();
  const { logout } = useAuthSession();
  const { sessionEmail, sessionName, sessionRole } = useSmartHome();
  const logoutLock = useRef(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const initial = sessionName.trim().charAt(0).toUpperCase() || "U";
  const roleLabel =
    sessionRole === "admin"
      ? t("profile.roleAdmin")
      : sessionRole === "miembro"
        ? t("profile.roleMember")
        : t("profile.roleGuest");

  function confirmLogout() {
    if (logoutLock.current) return;

    Alert.alert(t("action.logout"), t("profile.logoutPrompt"), [
      { text: t("action.cancel"), style: "cancel" },
      {
        text: t("action.logout"),
        style: "destructive",
        onPress: () => void endSession(),
      },
    ]);
  }

  async function endSession() {
    await runSingleFlight(logoutLock, async () => {
      setLoggingOut(true);

      try {
        await logout();
      } catch {
        // El cierre de sesión local se conserva aunque falle la solicitud remota.
      } finally {
        router.replace("/welcome");
      }
    });
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop + 12,
          paddingBottom: layout.screenBottom,
        }}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${sessionName}. ${sessionEmail}. ${roleLabel}`}
            accessibilityHint={t("profile.openPersonalInfoHint")}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/personal-info",
                params: { from: "profile" },
              })
            }
            style={({ pressed }) => [
              styles.identityCard,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
              pressed && styles.pressed,
            ]}
          >
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
                {initial}
              </Text>
            </View>
            <View style={styles.identityCopy}>
              <Text style={[styles.identityName, { color: theme.text }]}>
                {sessionName}
              </Text>
              <Text style={[styles.identityEmail, { color: theme.muted }]}>
                {sessionEmail}
              </Text>
              <View
                style={[
                  styles.rolePill,
                  { backgroundColor: theme.successSoft },
                ]}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={13}
                  color={theme.success}
                  accessible={false}
                />
                <Text style={[styles.roleText, { color: theme.success }]}>
                  {roleLabel}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.muted}
              accessible={false}
            />
          </Pressable>

          <View style={styles.shortcuts}>
            <ProfileShortcutCard
              icon="options-outline"
              title={t("settings.title")}
              description={t("settings.subtitle")}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/settings",
                  params: { from: "profile" },
                })
              }
            />
            <ProfileShortcutCard
              icon="shield-checkmark-outline"
              title={t("settings.accountSecurity")}
              description={t("settings.accountSecurityDescription")}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/account-security",
                  params: { from: "profile" },
                })
              }
            />
          </View>

          <SettingsSectionCard
            iconName="help-circle-outline"
            title={t("settings.helpSupport")}
          >
            <ProfileMenuItem
              variant="menu"
              icon="help-circle-outline"
              title={t("profile.helpCenter")}
              description={t("profile.helpSubtitle")}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/help",
                  params: { from: "profile" },
                })
              }
            />
            <ProfileMenuItem
              variant="menu"
              icon="information-circle-outline"
              title={t("settings.about")}
              description={t("settings.aboutDescription")}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/about-smart-home",
                  params: { from: "profile" },
                })
              }
            />
          </SettingsSectionCard>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("action.logout")}
            accessibilityState={{ disabled: loggingOut, busy: loggingOut }}
            disabled={loggingOut}
            onPress={confirmLogout}
            style={({ pressed }) => [
              styles.logout,
              {
                backgroundColor: theme.dangerSoft,
                borderColor: theme.dangerSoft,
                opacity: loggingOut ? 0.72 : 1,
              },
              pressed && styles.pressed,
            ]}
          >
            {loggingOut ? (
              <ActivityIndicator color={theme.danger} />
            ) : (
              <Ionicons
                name="log-out-outline"
                size={21}
                color={theme.danger}
                accessible={false}
              />
            )}
            <Text style={[styles.logoutText, { color: theme.danger }]}>
              {t("action.logout")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
