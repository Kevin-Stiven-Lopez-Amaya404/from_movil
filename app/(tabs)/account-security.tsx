import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


import { useActiveDeviceAlerts } from "@/lib/alerts/use-active-device-alerts";
import { useTranslation } from "@/lib/i18n/i18n";
import {
  returnToParent,
  useAndroidBackFallback,
} from "@/lib/navigation/use-android-back-fallback";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../styles/(tabs)/account-security.styles";

export default function AccountSecurityScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { t } = useTranslation();
  const {
    count: pendingAlerts,
    isLoading,
    hasError,
  } = useActiveDeviceAlerts();
  useAndroidBackFallback(from !== "profile", "/(tabs)/(main)/profile");

  const status = isLoading
    ? t("security.verifying")
    : hasError
      ? t("security.partial")
      : pendingAlerts > 0
        ? pendingAlerts === 1
          ? t("security.disconnectedDevice")
          : t("security.disconnectedDevices", { count: pendingAlerts })
        : t("security.noDisconnections");

  const statusColor =
    pendingAlerts > 0
      ? theme.danger
      : hasError || isLoading
        ? theme.muted
        : theme.success;

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
                styles.iconWrap,
                {
                  backgroundColor: theme.rowAlt,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color={theme.blue}
              />
            </View>
            <View style={styles.headerCopy}>
              <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
                {t("security.title")}
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                {t("security.subtitle")}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("security.sessions")}
              accessibilityHint={t("security.sessionsDescription")}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/close-sessions",
                  params: { from: "account-security" },
                })
              }
              style={({ pressed }) => [
                styles.controlRow,
                { borderBottomColor: theme.divider },
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.rowIcon, { backgroundColor: theme.rowAlt }]}>
                <Ionicons name="log-in-outline" size={18} color={theme.blue} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.controlTitle, { color: theme.text }]}>
                  {t("security.sessions")}
                </Text>
                <Text
                  style={[styles.controlDescription, { color: theme.muted }]}
                >
                  {t("security.sessionsDescription")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={21} color={theme.muted} />
            </Pressable>

            <View style={[styles.statusBox, { backgroundColor: theme.rowAlt }]}>
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: theme.successSoft },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={19}
                  color={statusColor}
                />
              </View>
              <View style={styles.statusCopy}>
                <Text style={[styles.statusLabel, { color: theme.muted }]}>
                  {t("security.deviceStatus")}
                </Text>
                <Text style={[styles.statusValue, { color: statusColor }]}>
                  {status}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
