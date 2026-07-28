/**
 * Pantalla de ajustes de la aplicación.
 *
 * Centraliza opciones de cuenta, apariencia e integraciones de voz.
 * Mantiene la UI consistente mediante componentes de tarjeta y filas de acción.
 */
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

const voiceIntegrations = [
  {
    descriptionKey: "settings.voiceAssistantDescription",
    icon: "mic-outline",
    titleKey: "settings.voiceAssistant",
  },
  {
    descriptionKey: "settings.voiceAlexaDescription",
    icon: "logo-amazon",
    titleKey: "Amazon Alexa",
  },
] as const;

/**
 * Pantalla de configuracion.
 *
 * Agrupa ajustes globales de cuenta, tema e integraciones. No maneja estado
 * local porque sus acciones afectan al contexto global de la aplicacion.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { t } = useTranslation();

  // Valores y acciones globales usados por configuracion.
  const { colorMode, deactivateAccount, sessionName, setColorMode } = useSmartHome();

  /**
   * Informa que una integracion esta preparada visualmente, pero aun no
   * conectada a backend/servicio externo.
   */
  function showPending(title: string) {
    Alert.alert(title, t("settings.pendingBody"));
  }

  /**
   * Confirma y ejecuta la desactivacion de cuenta.
   * Luego devuelve al usuario a bienvenida.
   */
  function confirmDeactivation() {
    Alert.alert(t("profile.deactivateAccount"), t("profile.deactivatePrompt"), [
      { text: t("action.cancel"), style: "cancel" },
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: layout.gutter,
            paddingBottom: layout.screenBottom,
            paddingTop: layout.screenTop,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="chevron-back" size={22} color={theme.blue} />
            <Text style={[styles.backText, { color: theme.blue }]}>{t("action.back")}</Text>
          </Pressable>

          <Text style={[styles.title, { color: theme.text }]}>{t("settings.title")}</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>{t("settings.subtitle")}</Text>

          <SettingsSectionCard
            backgroundColor={theme.card}
            description={`${sessionName}@smarthome.com`}
            descriptionColor={theme.muted}
            iconColor={theme.blue}
            iconName="person-circle-outline"
            title={t("settings.account")}
            titleColor={theme.text}
          >
            <SettingsActionRow
              backgroundColor={theme.row}
              borderColor={theme.border}
              iconColor={theme.blue}
              iconName="create-outline"
              onPress={() => router.push("/profile")}
              textColor={theme.text}
              title={t("profile.editInfo")}
            />
          </SettingsSectionCard>

          <SettingsSectionCard
            backgroundColor={theme.card}
            description={t("settings.appearanceDescription")}
            descriptionColor={theme.muted}
            iconColor={theme.blue}
            iconName="contrast-outline"
            title={t("settings.appearance")}
            titleColor={theme.text}
          >
            <ThemeModeSelector
              activeMode={colorMode}
              blueColor={theme.blue}
              borderColor={theme.border}
              labels={{ dark: t("settings.dark"), light: t("settings.light") }}
              onChange={setColorMode}
              rowColor={theme.row}
            />
          </SettingsSectionCard>

          <SettingsSectionCard
            backgroundColor={theme.card}
            description={t("settings.voiceDescription")}
            descriptionColor={theme.muted}
            iconColor={theme.blue}
            iconName="mic-circle-outline"
            title={t("settings.voiceIntegrations")}
            titleColor={theme.text}
          >
            {/* Lista de integraciones de voz simuladas, cada una con comportamiento pendiente. */}
            {voiceIntegrations.map((item) => {
              const title = item.titleKey === "Amazon Alexa" ? item.titleKey : t(item.titleKey);

              return (
                <SettingsActionRow
                  key={item.titleKey}
                  backgroundColor={theme.row}
                  borderColor={theme.border}
                  description={t(item.descriptionKey)}
                  iconColor={theme.blue}
                  iconName={item.icon as keyof typeof Ionicons.glyphMap}
                  onPress={() => showPending(title)}
                  mutedColor={theme.muted}
                  textColor={theme.text}
                  title={title}
                />
              );
            })}
          </SettingsSectionCard>

          <SettingsSectionCard
            backgroundColor={theme.dangerSoft}
            danger
            description={t("settings.deactivateDescription")}
            descriptionColor={theme.muted}
            iconColor={RED}
            iconName="person-remove-outline"
            title={t("profile.deactivateAccount")}
            titleColor={RED}
          >
            <Pressable style={styles.dangerButton} onPress={confirmDeactivation}>
              <Ionicons name="person-remove-outline" size={19} color={RED} />
              <Text style={styles.dangerButtonText}>{t("profile.deactivateAccount")}</Text>
            </Pressable>
          </SettingsSectionCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const appFont = typography.fontFamily.emphasis;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    alignItems: "center",
    paddingBottom: 112,
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  backButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginBottom: 14,
  },
  backText: {
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "800",
  },
  title: {
    fontFamily: appFont,
    fontSize: 26,
    fontWeight: "900",
  },
  subtitle: {
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  dangerButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#FFF1EF",
    borderColor: "#FFD1CB",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 46,
  },
  dangerButtonText: {
    color: RED,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "900",
  },
});
