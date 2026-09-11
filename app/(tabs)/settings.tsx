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

import { ThemeModeSelector } from "@/components/settings/ThemeModeSelector";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useTranslation } from "@/lib/i18n/i18n";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

const appFont = typography.fontFamily.emphasis;
type ThemeLike = ReturnType<typeof useAppTheme>;

type RowProps = {
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  theme: ThemeLike;
  title: string;
};

function SettingRow({ description, icon, onPress, theme, title }: RowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.rowIcon, { backgroundColor: theme.rowAlt }]}>
        <Ionicons name={icon} size={17} color={theme.blue} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>
        {!!description && (
          <Text style={[styles.rowDescription, { color: theme.muted }]}>
            {description}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.muted} />
    </Pressable>
  );
}

type GroupProps = {
  children: React.ReactNode;
  icon: keyof typeof Ionicons.glyphMap;
  theme: ThemeLike;
  title: string;
};

function Group({ children, icon, theme, title }: GroupProps) {
  return (
    <View style={styles.group}>
      <View style={styles.groupTitleRow}>
        <Ionicons name={icon} size={16} color={theme.blue} />
        <Text style={[styles.groupTitle, { color: theme.text }]}>{title}</Text>
      </View>
      <View
        style={[
          styles.groupCard,
          { backgroundColor: theme.card, borderColor: theme.borderLight },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { t } = useTranslation();
  const { colorMode, deactivateAccount, setColorMode, setLanguage } =
    useSmartHome();

  function showPending(title: string) {
    Alert.alert(title, t("common.readyBackend"), [
      { text: t("action.cancel") },
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
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chevron-back" size={17} color={theme.blue} />
            <Text style={[styles.backText, { color: theme.blue }]}>Volver</Text>
          </Pressable>

          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: theme.blue1 }]}>
              <Ionicons name="settings-outline" size={21} color={theme.blue} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.text }]}>
                {t("settings.title")}
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                Personaliza tu experiencia en Smart Home.
              </Text>
            </View>
          </View>

          <Group icon="options-outline" title="Preferencias" theme={theme}>
            <View style={styles.appearanceRow}>
              <View style={[styles.rowIcon, { backgroundColor: theme.rowAlt }]}>
                <Ionicons
                  name="contrast-outline"
                  size={17}
                  color={theme.blue}
                />
              </View>
              <View style={styles.rowCopy}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>
                  {t("settings.appearance")}
                </Text>
                <Text style={[styles.rowDescription, { color: theme.muted }]}>
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
              labels={{ dark: t("settings.dark"), light: t("settings.light") }}
              onChange={setColorMode}
              rowColor={theme.row}
            />
            <SettingRow
              icon="language-outline"
              title="Idioma"
              description="Español (Colombia)"
              onPress={chooseLanguage}
              theme={theme}
            />
            <SettingRow
              icon="notifications-outline"
              title="Notificaciones"
              description="Configura tus alertas"
              onPress={() => showPending(t("profile.messageCenter"))}
              theme={theme}
            />
          </Group>

          <Group
            icon="help-circle-outline"
            title="Ayuda y soporte"
            theme={theme}
          >
            <SettingRow
              icon="help-circle-outline"
              title="Centro de ayuda"
              description="Preguntas frecuentes y soporte"
              onPress={() => router.push("/(tabs)/help")}
              theme={theme}
            />
            <SettingRow
              icon="warning-outline"
              title="Reportar un problema"
              description="Informa un error en la app"
              onPress={() => showPending(t("settings.reportProblem"))}
              theme={theme}
            />
          </Group>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("profile.deactivateAccount")}
            onPress={confirmDeactivation}
            style={({ pressed }) => [
              styles.dangerRow,
              {
                backgroundColor: theme.dangerSoft,
                borderColor: theme.dangerSoft,
              },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.dangerIcon}>
              <Ionicons
                name="person-remove-outline"
                size={17}
                color={theme.danger}
              />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: theme.danger }]}>
                {t("profile.deactivateAccount")}
              </Text>
              <Text style={[styles.rowDescription, { color: theme.danger }]}>
                {t("profile.deactivateDescription")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.danger} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { alignSelf: "center", width: "100%" },
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 3,
    marginBottom: 11,
  },
  backText: { fontFamily: appFont, fontSize: 11, fontWeight: "800" },
  header: { alignItems: "center", flexDirection: "row", marginBottom: 17 },
  headerIcon: {
    alignItems: "center",
    borderRadius: 11,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  headerCopy: { flex: 1, marginLeft: 10 },
  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: 23,
    fontWeight: "900",
  },
  subtitle: { fontFamily: appFont, fontSize: 10, marginTop: 2 },
  group: { marginBottom: 16 },
  groupTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  groupTitle: { fontFamily: appFont, fontSize: 13, fontWeight: "900" },
  groupCard: {
    borderRadius: 13,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 8,
  },
  appearanceRow: { alignItems: "center", flexDirection: "row", minHeight: 49 },
  row: {
    alignItems: "center",
    borderTopColor: "#E2E8F0",
    borderTopWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    paddingVertical: 6,
  },
  rowIcon: {
    alignItems: "center",
    borderRadius: 9,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  rowCopy: { flex: 1, marginHorizontal: 9 },
  rowTitle: { fontFamily: appFont, fontSize: 11, fontWeight: "800" },
  rowDescription: { fontFamily: appFont, fontSize: 9, marginTop: 2 },
  dangerRow: {
    alignItems: "center",
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: 10,
  },
  dangerIcon: {
    alignItems: "center",
    backgroundColor: "#FFFFFF99",
    borderRadius: 9,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  pressed: { opacity: 0.72 },
});
