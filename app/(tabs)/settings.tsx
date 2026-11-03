import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ColorPaletteSelector } from "@/components/settings/ColorPaletteSelector";
import { SettingsActionRow } from "@/components/settings/SettingsActionRow";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { ThemeModeSelector } from "@/components/settings/ThemeModeSelector";
import { useSmartHome } from "@/lib/context/smart-home-context";
import type { ColorMode } from "@/lib/domain/preferences";
import { useTranslation } from "@/lib/i18n/i18n";
import {
  returnToParent,
  useAndroidBackFallback,
} from "@/lib/navigation/use-android-back-fallback";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { runSingleFlight } from "@/lib/utils/async-action-lock";
import { styles } from "../../styles/(tabs)/settings.styles";

export default function SettingsScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { t } = useTranslation();
  const {
    colorMode,
    colorPalette,
    deactivateAccount,
    language,
    setColorMode,
    setColorPalette,
  } = useSmartHome();
  const deactivationLock = useRef(false);
  const [deactivating, setDeactivating] = useState(false);

  useAndroidBackFallback(from !== "profile", "/(tabs)/(main)/profile");

  const modeLabels: Record<ColorMode, string> = {
    system: t("settings.system"),
    light: t("settings.light"),
    dark: t("settings.dark"),
  };

  const languageLabel =
    language === "en"
      ? "English"
      : language === "pt"
        ? "Português (Brasil)"
        : "Español (Colombia)";

  function confirmDeactivation() {
    if (deactivationLock.current) return;

    Alert.alert(
      t("profile.deactivateAccount"),
      t("profile.deactivatePrompt"),
      [
        { text: t("action.cancel"), style: "cancel" },
        {
          text: t("action.deactivate"),
          style: "destructive",
          onPress: () => void deactivate(),
        },
      ],
    );
  }

  async function deactivate() {
    await runSingleFlight(deactivationLock, async () => {
      setDeactivating(true);

      try {
        await deactivateAccount();
        router.replace("/welcome");
      } catch {
        setDeactivating(false);
        Alert.alert(
          t("profile.deactivateAccount"),
          t("settings.deactivationError"),
        );
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
          alignItems: "center",
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop + 8,
          paddingBottom: layout.screenBottom,
        }}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <View style={styles.screenHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("action.back")}
              accessibilityHint={t("settings.backToProfileHint")}
              hitSlop={8}
              onPress={() =>
                returnToParent(
                  router,
                  from,
                  "profile",
                  "/(tabs)/(main)/profile",
                )
              }
              style={({ pressed }) => [
                styles.backButton,
                { backgroundColor: theme.rowAlt },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="chevron-back" size={21} color={theme.text} />
            </Pressable>
            <View style={styles.headerCopy}>
              <Text
                accessibilityRole="header"
                style={[styles.title, { color: theme.text }]}
              >
                {t("settings.title")}
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                {t("settings.subtitle")}
              </Text>
            </View>
          </View>

          <SettingsSectionCard
            iconName="contrast-outline"
            title={t("settings.appearance")}
            description={t("settings.appearanceDescription")}
          >
            <View style={styles.appearanceControls}>
              <Text style={[styles.currentValue, { color: theme.muted }]}>
                {modeLabels[colorMode]}
              </Text>
              <ThemeModeSelector
                accessibilityLabel={t("settings.appearance")}
                activeMode={colorMode}
                blueColor={theme.blue}
                borderColor={theme.border}
                labels={modeLabels}
                onPrimaryColor={theme.onPrimary}
                onChange={setColorMode}
                rowColor={theme.row}
              />
              <ColorPaletteSelector
                activePalette={colorPalette}
                accessibilityLabel={t("settings.colorPalette")}
                borderColor={theme.border}
                labels={{
                  classic: t("settings.paletteClassic"),
                  emerald: t("settings.paletteEmerald"),
                }}
                onChange={setColorPalette}
                onPrimaryColor={theme.onPrimary}
                primaryColor={theme.blue}
                rowColor={theme.row}
                textColor={theme.text}
                title={t("settings.colorPalette")}
              />
            </View>
          </SettingsSectionCard>

          <SettingsSectionCard
            iconName="globe-outline"
            title={t("profile.language")}
            description={t("profile.languageDescription")}
          >
            <SettingsActionRow
              accessibilityHint={t("settings.openLanguageHint")}
              backgroundColor={theme.card}
              borderColor={theme.borderLight}
              description={languageLabel}
              iconName="language-outline"
              iconColor={theme.blue}
              mutedColor={theme.muted}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/language",
                  params: { from: "settings" },
                })
              }
              textColor={theme.text}
              title={t("profile.language")}
            />
          </SettingsSectionCard>

          <View
            style={[
              styles.syncCard,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <View
              style={[styles.syncIcon, { backgroundColor: theme.rowAlt }]}
            >
              <Ionicons
                name="sync-outline"
                size={20}
                color={theme.blue}
                accessible={false}
              />
            </View>
            <View style={styles.syncCopy}>
              <Text
                accessibilityRole="header"
                style={[styles.syncTitle, { color: theme.text }]}
              >
                {t("settings.sync")}
              </Text>
              <Text style={[styles.syncDescription, { color: theme.muted }]}>
                {t("settings.syncDescription")}
              </Text>
            </View>
          </View>

          <SettingsSectionCard
            iconName="lock-closed-outline"
            title={t("profile.securityData")}
          >
            <SettingsActionRow
              accessibilityHint={t("settings.openPasswordHint")}
              backgroundColor={theme.card}
              borderColor={theme.borderLight}
              description={t("settings.changePasswordDescription")}
              iconName="key-outline"
              iconColor={theme.blue}
              mutedColor={theme.muted}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/change-password",
                  params: { from: "settings" },
                })
              }
              textColor={theme.text}
              title={t("settings.changePassword")}
            />
          </SettingsSectionCard>

          <SettingsSectionCard
            danger
            iconName="warning-outline"
            title={t("settings.dangerZone")}
          >
            <SettingsActionRow
              accessibilityHint={t("settings.deactivateHint")}
              backgroundColor={theme.dangerSoft}
              borderColor={theme.dangerSoft}
              description={t("profile.deactivateDescription")}
              iconName="person-remove-outline"
              iconColor={theme.danger}
              mutedColor={theme.danger}
              onPress={confirmDeactivation}
              pending={deactivating}
              textColor={theme.danger}
              title={t("profile.deactivateAccount")}
            />
          </SettingsSectionCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
