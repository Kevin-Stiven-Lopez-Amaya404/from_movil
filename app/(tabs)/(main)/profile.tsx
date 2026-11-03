import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileMenuItem } from "@/components/profile/ProfileMenuItem";
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
  const { sessionEmail, sessionName } = useSmartHome();
  const logoutLock = useRef(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = sessionName.trim();
  const displayEmail = sessionEmail.trim();
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0] ?? "")
    .join("")
    .toUpperCase();
  const nameValue = displayName || t("profile.dataUnavailable");
  const emailValue = displayEmail || t("profile.dataUnavailable");

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
        // Local session cleanup is preserved if the remote request fails.
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
          <View style={styles.identity}>
            <View
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              style={[
                styles.avatar,
                {
                  backgroundColor: theme.rowAlt,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              {initials ? (
                <Text style={[styles.avatarText, { color: theme.blue }]}>
                  {initials}
                </Text>
              ) : (
                <Ionicons
                  name="person-outline"
                  size={34}
                  color={theme.blue}
                  accessible={false}
                />
              )}
            </View>
            <Text
              accessibilityRole="header"
              style={[styles.identityName, { color: theme.text }]}
            >
              {nameValue}
            </Text>
            <Text style={[styles.identityEmail, { color: theme.muted }]}>
              {emailValue}
            </Text>
          </View>

          <SettingsSectionCard
            iconName="person-outline"
            title={t("profile.personalInfo")}
          >
            <View style={styles.accountDetails}>
              <View style={styles.accountField}>
                <Text style={[styles.accountLabel, { color: theme.muted }]}>
                  {t("profile.registeredName")}
                </Text>
                <Text style={[styles.accountValue, { color: theme.text }]}>
                  {nameValue}
                </Text>
              </View>
              <View
                style={[
                  styles.accountDivider,
                  { backgroundColor: theme.divider },
                ]}
              />
              <View style={styles.accountField}>
                <Text style={[styles.accountLabel, { color: theme.muted }]}>
                  {t("profile.registeredEmail")}
                </Text>
                <Text style={[styles.accountValue, { color: theme.text }]}>
                  {emailValue}
                </Text>
              </View>
            </View>
          </SettingsSectionCard>

          <SettingsSectionCard
            iconName="shield-checkmark-outline"
            title={t("profile.securityTitle")}
            description={t("profile.securityDescription")}
          >
            <ProfileMenuItem
              variant="menu"
              icon="lock-closed-outline"
              title={t("settings.changePassword")}
              description={t("settings.changePasswordDescription")}
              showChevron
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/change-password",
                  params: { from: "profile" },
                })
              }
            />
            <ProfileMenuItem
              variant="menu"
              icon="log-in-outline"
              title={t("profile.manageSessions")}
              description={t("profile.manageSessionsDescription")}
              showChevron
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/account-security",
                  params: { from: "profile" },
                })
              }
            />
          </SettingsSectionCard>

          <ProfileMenuItem
            variant="boxed"
            icon="options-outline"
            title={t("settings.title")}
            description={t("profile.settingsDescription")}
            showChevron
            onPress={() =>
              router.push({
                pathname: "/(tabs)/settings",
                params: { from: "profile" },
              })
            }
          />

          <View
            style={[styles.logoutArea, { borderTopColor: theme.borderLight }]}
          >
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
                  borderColor: theme.borderLight,
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
