import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/lib/app-theme";
import { useTranslation } from "@/lib/i18n";
import { useResponsiveLayout } from "@/lib/responsive";
import { ColorMode, useSmartHome } from "@/lib/smart-home-context";

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

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle-outline" size={28} color={theme.blue} />
              <View style={styles.sectionCopy}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("settings.account")}</Text>
                <Text style={[styles.sectionDescription, { color: theme.muted }]}>{sessionName}@smarthome.com</Text>
              </View>
            </View>
            <Pressable
              style={[styles.row, { backgroundColor: theme.row, borderColor: theme.border }]}
              onPress={() => router.push("/profile")}
            >
              <Ionicons name="create-outline" size={22} color={theme.blue} />
              <Text style={[styles.rowText, { color: theme.text }]}>{t("profile.editInfo")}</Text>
            </Pressable>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="contrast-outline" size={26} color={theme.blue} />
              <View style={styles.sectionCopy}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("settings.appearance")}</Text>
                <Text style={[styles.sectionDescription, { color: theme.muted }]}>
                  {t("settings.appearanceDescription")}
                </Text>
              </View>
            </View>
            <View style={styles.themeRow}>
              {(["light", "dark"] as ColorMode[]).map((mode) => {
                const active = colorMode === mode;

                return (
                  <Pressable
                    key={mode}
                    style={[
                      styles.themeButton,
                      { backgroundColor: theme.row, borderColor: theme.border },
                      active && { backgroundColor: theme.blue, borderColor: theme.blue },
                    ]}
                    onPress={() => setColorMode(mode)}
                  >
                    <Ionicons
                      name={mode === "light" ? "sunny-outline" : "moon-outline"}
                      size={19}
                      color={active ? "#FFFFFF" : theme.blue}
                    />
                    <Text style={[styles.themeText, { color: active ? "#FFFFFF" : theme.blue }]}>
                      {mode === "light" ? t("settings.light") : t("settings.dark")}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="mic-circle-outline" size={28} color={theme.blue} />
              <View style={styles.sectionCopy}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("settings.voiceIntegrations")}</Text>
                <Text style={[styles.sectionDescription, { color: theme.muted }]}>{t("settings.voiceDescription")}</Text>
              </View>
            </View>
            {voiceIntegrations.map((item) => {
              const title = item.titleKey === "Amazon Alexa" ? item.titleKey : t(item.titleKey);

              return (
                <Pressable
                  key={item.titleKey}
                  style={[styles.row, { backgroundColor: theme.row, borderColor: theme.border }]}
                  onPress={() => showPending(title)}
                >
                  <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={22} color={theme.blue} />
                  <View style={styles.rowCopy}>
                    <Text style={[styles.rowText, { color: theme.text }]}>{title}</Text>
                    <Text style={[styles.rowDescription, { color: theme.muted }]}>{t(item.descriptionKey)}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.card, styles.dangerCard, { backgroundColor: theme.dangerSoft }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-remove-outline" size={26} color={RED} />
              <View style={styles.sectionCopy}>
                <Text style={[styles.sectionTitle, styles.dangerTitle]}>{t("profile.deactivateAccount")}</Text>
                <Text style={[styles.sectionDescription, { color: theme.muted }]}>
                  {t("settings.deactivateDescription")}
                </Text>
              </View>
            </View>
            <Pressable style={styles.dangerButton} onPress={confirmDeactivation}>
              <Ionicons name="person-remove-outline" size={19} color={RED} />
              <Text style={styles.dangerButtonText}>{t("profile.deactivateAccount")}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const appFont = "sans-serif-medium";

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
  card: {
    borderRadius: 16,
    gap: 14,
    marginTop: 18,
    padding: 16,
  },
  dangerCard: {
    borderColor: "#FFD1CB",
    borderWidth: 1,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  sectionCopy: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "900",
  },
  dangerTitle: {
    color: RED,
  },
  sectionDescription: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 3,
  },
  row: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 12,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowText: {
    flex: 1,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "800",
  },
  rowDescription: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 3,
  },
  themeRow: {
    flexDirection: "row",
    gap: 10,
  },
  themeButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 46,
  },
  themeText: {
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "900",
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
