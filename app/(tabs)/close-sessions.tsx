import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


import { authService } from "@/lib/services/auth-service";
import { useTranslation } from "@/lib/i18n/i18n";
import { clearSession } from "@/lib/session/session-store";
import { runSingleFlight } from "@/lib/utils/async-action-lock";
import {
  returnToParent,
  useAndroidBackFallback,
} from "@/lib/navigation/use-android-back-fallback";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../styles/(tabs)/close-sessions.styles";

export default function CloseSessionsScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const closeSessionsLock = useRef(false);
  useAndroidBackFallback(
    from !== "account-security",
    "/(tabs)/account-security",
  );

  function requestCloseSessions() {
    if (submitting || closeSessionsLock.current) return;

    Alert.alert(
      t("closeSessions.title"),
      t("closeSessions.confirmPrompt"),
      [
        { text: t("action.cancel"), style: "cancel" },
        {
          text: t("action.confirm"),
          style: "destructive",
          onPress: () => void closeAllSessions(),
        },
      ],
    );
  }

  async function closeAllSessions() {
    await runSingleFlight(closeSessionsLock, async () => {
      setSubmitting(true);

      try {
        await authService.logout(true);
        await clearSession();
        Alert.alert(
          t("closeSessions.successTitle"),
          t("closeSessions.successBody"),
          [{ text: t("action.accept"), onPress: () => router.replace("/login") }],
        );
      } catch {
        Alert.alert(
          t("closeSessions.failureTitle"),
          t("closeSessions.failureBody"),
        );
      } finally {
        setSubmitting(false);
      }
    });
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: layout.gutter,
            paddingTop: layout.screenTop,
            paddingBottom: 120,
          }}
        >
          <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("action.back")}
              onPress={() =>
                returnToParent(
                  router,
                  from,
                  "account-security",
                  "/(tabs)/account-security",
                )
              }
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: theme.rowAlt },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                accessible={false}
                name="close"
                size={22}
                color={theme.text}
              />
            </Pressable>

            <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
              {t("closeSessions.title")}
            </Text>
            <Text style={[styles.description, { color: theme.text }]}>
              {t("closeSessions.description")}
            </Text>

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: theme.rowAlt,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={25}
                color={theme.blue}
              />
              <Text style={[styles.infoText, { color: theme.muted }]}>
                {t("closeSessions.info")}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.background,
              borderTopColor: theme.borderLight,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("closeSessions.title")}
            accessibilityState={{ disabled: submitting, busy: submitting }}
            disabled={submitting}
            onPress={requestCloseSessions}
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: theme.solidActionBackground, opacity: submitting ? 0.7 : 1 },
              pressed && styles.pressed,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={theme.onSolidAction} />
            ) : (
              <Text style={[styles.submitText, { color: theme.onSolidAction }]}>
                {t("closeSessions.title")}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
