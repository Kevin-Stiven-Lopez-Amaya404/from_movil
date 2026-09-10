import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SettingsActionRow } from "@/components/settings/SettingsActionRow";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { ThemeModeSelector } from "@/components/settings/ThemeModeSelector";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useTranslation } from "@/lib/i18n/i18n";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

const RED = "#FF3B20";
const appFont = typography.fontFamily.emphasis;

export default function SettingsScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { t } = useTranslation();

  const {
    colorMode,
    deactivateAccount,
    offlineMode,
    sessionName,
    setColorMode,
    setLanguage,
    setOfflineMode,
  } = useSmartHome();

  function showPending(title: string) {
    Alert.alert(title, t("common.readyBackend"), [
      {
        text: t("action.cancel"),
        style: "cancel",
      },
    ]);
  }

  function confirmDeactivation() {
    Alert.alert(t("profile.deactivateAccount"), t("profile.deactivatePrompt"), [
      {
        text: t("action.cancel"),
        style: "cancel",
      },
      {
        text: t("action.deactivate"),
        style: "destructive",
        onPress: () => {
          deactivateAccount();
          router.replace("/welcome");
        },
      },
    ]);
  }

  function chooseLanguage() {
    Alert.alert(t("profile.language"), t("profile.languageDescription"), [
      { text: "Español", onPress: () => setLanguage("es") },
      { text: "English", onPress: () => setLanguage("en") },
      { text: "Português", onPress: () => setLanguage("pt") },
      { text: t("action.cancel"), style: "cancel" },
    ]);
  }

  function toggleOfflineMode() {
    const nextValue = !offlineMode;
    setOfflineMode(nextValue);
    Alert.alert(
      t("profile.offline"),
      nextValue ? t("profile.offlineOnText") : t("profile.offlineOffText"),
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: layout.gutter,
            paddingTop: layout.screenTop,
            paddingBottom: layout.screenBottom,
          },
        ]}
      >
        <View
          style={[
            styles.content,
            {
              maxWidth: layout.contentWidth,
            },
          ]}
        >
          {/* VOLVER */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("action.back")}
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chevron-back" size={22} color={theme.blue} />

            <Text
              style={[
                styles.backText,
                {
                  color: theme.blue,
                },
              ]}
            >
              {t("action.back")}
            </Text>
          </Pressable>

          {/* ENCABEZADO */}
          <View style={styles.header}>
            <View
              style={[
                styles.headerIcon,
                {
                  backgroundColor: theme.rowAlt,
                },
              ]}
            >
              <Ionicons name="settings-outline" size={26} color={theme.blue} />
            </View>

            <View style={styles.headerCopy}>
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {t("settings.title")}
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color: theme.muted,
                  },
                ]}
              >
                {t("settings.subtitle")}
              </Text>
            </View>
          </View>

          {/* CUENTA */}
          <SettingsSectionCard
            backgroundColor={theme.card}
            description={sessionName}
            descriptionColor={theme.muted}
            iconColor={theme.blue}
            iconName="person-circle-outline"
            title={t("settings.account")}
            titleColor={theme.text}
          >
            <SettingsActionRow
              backgroundColor={theme.row}
              borderColor={theme.border}
              description={sessionName}
              iconColor={theme.blue}
              iconName="person-outline"
              mutedColor={theme.muted}
              onPress={() => router.push("/profile")}
              textColor={theme.text}
              title={t("settings.account")}
            />

            <SettingsActionRow
              backgroundColor={theme.row}
              borderColor={theme.border}
              description={t("profile.editInfo")}
              iconColor={theme.blue}
              iconName="create-outline"
              mutedColor={theme.muted}
              onPress={() => router.push("/profile")}
              textColor={theme.text}
              title={t("profile.editInfo")}
            />
          </SettingsSectionCard>

          {/* PREFERENCIAS */}
          <SettingsSectionCard
            backgroundColor={theme.card}
            description={t("profile.preferencesSubtitle")}
            descriptionColor={theme.muted}
            iconColor={theme.blue}
            iconName="options-outline"
            title={t("profile.preferences")}
            titleColor={theme.text}
          >
            {/* APARIENCIA */}
            <View
              style={[
                styles.preferenceCard,
                {
                  backgroundColor: theme.row,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.preferenceHeader}>
                <View
                  style={[
                    styles.preferenceIcon,
                    {
                      backgroundColor: `${theme.blue}12`,
                    },
                  ]}
                >
                  <Ionicons
                    name="contrast-outline"
                    size={20}
                    color={theme.blue}
                  />
                </View>

                <View style={styles.preferenceCopy}>
                  <Text
                    style={[
                      styles.preferenceTitle,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {t("settings.appearance")}
                  </Text>

                  <Text
                    style={[
                      styles.preferenceDescription,
                      {
                        color: theme.muted,
                      },
                    ]}
                  >
                    {colorMode === "dark"
                      ? t("settings.dark")
                      : t("settings.light")}
                  </Text>
                </View>
              </View>

              <ThemeModeSelector
                activeMode={colorMode}
                blueColor={theme.blue}
                borderColor={theme.border}
                labels={{
                  dark: t("settings.dark"),
                  light: t("settings.light"),
                }}
                onChange={setColorMode}
                rowColor={theme.row}
              />
            </View>

            {/* IDIOMA */}
            <SettingsActionRow
              backgroundColor={theme.row}
              borderColor={theme.border}
              description={t("profile.languageDescription")}
              iconColor={theme.blue}
              iconName="language-outline"
              mutedColor={theme.muted}
              onPress={chooseLanguage}
              textColor={theme.text}
              title={t("profile.language")}
            />

            {/* MODO SIN CONEXIÓN */}
            <SettingsActionRow
              backgroundColor={theme.row}
              borderColor={theme.border}
              description={t("profile.offlineDescription")}
              iconColor={theme.blue}
              iconName="cloud-offline-outline"
              mutedColor={theme.muted}
              onPress={toggleOfflineMode}
              textColor={theme.text}
              title={t("profile.offline")}
            />
          </SettingsSectionCard>

          {/* AYUDA Y SOPORTE */}
          <SettingsSectionCard
            backgroundColor={theme.card}
            description={t("profile.helpSubtitle")}
            descriptionColor={theme.muted}
            iconColor={theme.blue}
            iconName="help-circle-outline"
            title={t("settings.helpSupport")}
            titleColor={theme.text}
          >
            <SettingsActionRow
              backgroundColor={theme.row}
              borderColor={theme.border}
              description={t("profile.helpSubtitle")}
              iconColor={theme.blue}
              iconName="help-circle-outline"
              mutedColor={theme.muted}
              onPress={() => router.push("/(tabs)/help")}
              textColor={theme.text}
              title={t("profile.helpCenter")}
            />

            <SettingsActionRow
              backgroundColor={theme.row}
              borderColor={theme.border}
              description={t("settings.messageDescription")}
              iconColor={theme.blue}
              iconName="chatbubble-ellipses-outline"
              mutedColor={theme.muted}
              onPress={() => showPending(t("profile.messageCenter"))}
              textColor={theme.text}
              title={t("profile.messageCenter")}
            />

            <SettingsActionRow
              backgroundColor={theme.row}
              borderColor={theme.border}
              description={t("settings.reportProblemDescription")}
              iconColor={theme.blue}
              iconName="warning-outline"
              mutedColor={theme.muted}
              onPress={() => showPending(t("settings.reportProblem"))}
              textColor={theme.text}
              title={t("settings.reportProblem")}
            />

            <SettingsActionRow
              backgroundColor={theme.row}
              borderColor={theme.border}
              description={t("settings.aboutDescription")}
              iconColor={theme.blue}
              iconName="information-circle-outline"
              mutedColor={theme.muted}
              onPress={() => showPending(t("settings.about"))}
              textColor={theme.text}
              title={t("settings.about")}
            />
          </SettingsSectionCard>

          {/* SEGURIDAD Y DATOS */}
          <SettingsSectionCard
            backgroundColor={theme.card}
            description={t("profile.securityDataSubtitle")}
            descriptionColor={theme.muted}
            iconColor={theme.blue}
            iconName="shield-checkmark-outline"
            title={t("profile.securityData")}
            titleColor={theme.text}
          >
            <SettingsActionRow
              backgroundColor={theme.row}
              borderColor={theme.border}
              description={t("profile.auditDescription")}
              iconColor={theme.blue}
              iconName="document-text-outline"
              mutedColor={theme.muted}
              onPress={() => showPending(t("profile.audit"))}
              textColor={theme.text}
              title={t("profile.audit")}
            />

            <SettingsActionRow
              backgroundColor={theme.row}
              borderColor={theme.border}
              description={t("profile.restoreDescription")}
              iconColor={theme.blue}
              iconName="refresh-outline"
              mutedColor={theme.muted}
              onPress={() => showPending(t("profile.restoreData"))}
              textColor={theme.text}
              title={t("profile.restoreData")}
            />
          </SettingsSectionCard>

          {/* DESACTIVAR CUENTA */}
          <SettingsSectionCard
            backgroundColor={theme.dangerSoft}
            danger
            description={t("profile.deactivateDescription")}
            descriptionColor={theme.muted}
            iconColor={RED}
            iconName="person-remove-outline"
            title={t("profile.deactivateAccount")}
            titleColor={RED}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("profile.deactivateAccount")}
              onPress={confirmDeactivation}
              style={({ pressed }) => [
                styles.dangerButton,
                {
                  backgroundColor: theme.card,
                  borderColor: "#FFD1CB",
                },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.dangerIcon}>
                <Ionicons name="person-remove-outline" size={18} color={RED} />
              </View>

              <View style={styles.dangerCopy}>
                <Text style={styles.dangerTitle}>
                  {t("profile.deactivateAccount")}
                </Text>

                <Text style={styles.dangerDescription}>
                  {t("profile.deactivateDescription")}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={RED} />
            </Pressable>
          </SettingsSectionCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 4,
    marginBottom: 14,
    paddingVertical: 4,
  },

  backText: {
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "900",
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 13,
  },

  headerIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    width: 52,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontFamily: appFont,
    fontSize: 27,
    fontWeight: "900",
  },

  subtitle: {
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 3,
  },

  preferenceCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
  },

  preferenceHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  preferenceIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  preferenceCopy: {
    flex: 1,
    minWidth: 0,
  },

  preferenceTitle: {
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "900",
  },

  preferenceDescription: {
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  dangerButton: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  dangerIcon: {
    alignItems: "center",
    backgroundColor: "#FFF1EF",
    borderRadius: 10,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  dangerCopy: {
    flex: 1,
    minWidth: 0,
  },

  dangerTitle: {
    color: RED,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "900",
  },

  dangerDescription: {
    color: "#8C6863",
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
    marginTop: 2,
  },

  pressed: {
    opacity: 0.7,
  },
});
