import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


import { useAuthSession } from "@/lib/auth/auth-session-context";
import { ThemeModeSelector } from "@/components/settings/ThemeModeSelector";
import { ColorPaletteSelector } from "@/components/settings/ColorPaletteSelector";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useTranslation } from "@/lib/i18n/i18n";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { useActiveDeviceAlerts } from "@/lib/alerts/use-active-device-alerts";
import { styles } from "../../../styles/(tabs)/(main)/profile.styles";


type ThemeLike = ReturnType<typeof useAppTheme>;

type RowProps = {
  danger?: boolean;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  theme: ThemeLike;
  title: string;
};

function Row({
  danger = false,
  description,
  icon,
  onPress,
  theme,
  title,
}: RowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderTopColor: theme.profileDivider },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: theme.rowAlt }]}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? theme.danger : theme.blue}
        />
      </View>
      <View style={styles.rowCopy}>
        <Text
          style={[
            styles.rowTitle,
            { color: danger ? theme.danger : theme.text },
          ]}
        >
          {title}
        </Text>
        {!!description && (
          <Text style={[styles.rowDescription, { color: theme.muted }]}>
            {description}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.muted} />
    </Pressable>
  );
}

type SectionProps = {
  children: React.ReactNode;
  icon: keyof typeof Ionicons.glyphMap;
  theme: ThemeLike;
  title: string;
};

function Section({ children, icon, theme, title }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Ionicons name={icon} size={17} color={theme.blue} />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {title}
        </Text>
      </View>
      <View
        style={[
          styles.rows,
          { backgroundColor: theme.card, borderColor: theme.borderLight },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { t } = useTranslation();
  const { logout } = useAuthSession();
  const {
    colorMode,
    colorPalette,
    deactivateAccount,
    language,
    sessionEmail,
    sessionName,
    sessionRole,
    setColorMode,
    setColorPalette,
  } = useSmartHome();

  const { count: pendingAlerts } = useActiveDeviceAlerts();
  const initial = sessionName.trim().charAt(0).toUpperCase() || "U";
  const languageLabel =
    language === "en"
      ? "English"
      : language === "pt"
        ? "Português (Brasil)"
        : "Español (Colombia)";
  const roleLabel =
    sessionRole === "admin"
      ? "Administrador"
      : sessionRole === "miembro"
        ? "Miembro"
        : "Invitado";
  const colorModeLabel = {
    system: "Sistema",
    light: "Claro",
    dark: "Oscuro",
  }[colorMode];

  function confirmLogout() {
    Alert.alert(t("action.logout"), t("profile.logoutPrompt"), [
      { text: t("action.cancel"), style: "cancel" },
      {
        text: t("action.logout"),
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await logout();
            } catch {
              // El contexto siempre limpia la sesión local aunque el backend no responda.
            } finally {
              router.replace("/welcome");
            }
          })();
        },
      },
    ]);
  }

  function showPending(title: string) {
    Alert.alert(title, t("common.readyBackend"), [
      { text: t("action.cancel") },
    ]);
  }

  function confirmDeactivation() {
    Alert.alert(t("profile.deactivateAccount"), t("profile.deactivatePrompt"), [
      { text: t("action.cancel"), style: "cancel" },
      {
        text: t("action.deactivate"),
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await deactivateAccount();
              router.replace("/welcome");
            } catch (error) {
              Alert.alert(
                t("profile.deactivateAccount"),
                error instanceof Error
                  ? error.message
                  : "No se pudo desactivar la cuenta. Inténtalo de nuevo.",
              );
            }
          })();
        },
      },
    ]);
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
            accessibilityLabel="Ver información personal"
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
                {sessionEmail || "pepe@smarthome.com"}
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
                />
                <Text style={[styles.roleText, { color: theme.success }]}>
                  {roleLabel}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.muted} />
          </Pressable>

          <Section icon="person-outline" title="Cuenta" theme={theme}>
            <Row
              icon="person-outline"
              title="Información personal"
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/personal-info",
                  params: { from: "profile" },
                })
              }
              theme={theme}
            />
            <Row
              danger
              icon="person-remove-outline"
              title={t("profile.deactivateAccount")}
              description={t("profile.deactivateDescription")}
              onPress={confirmDeactivation}
              theme={theme}
            />
          </Section>

          <Section icon="lock-closed-outline" title="Seguridad" theme={theme}>
            <Row
              icon="lock-closed-outline"
              title="Cambiar contraseña"
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/change-password",
                  params: { from: "profile" },
                })
              }
              theme={theme}
            />
            <Row
              icon="shield-checkmark-outline"
              title="Seguridad de la cuenta"
              description={`${pendingAlerts} alertas pendientes`}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/account-security",
                  params: { from: "profile" },
                })
              }
              theme={theme}
            />
          </Section>

          <Section icon="options-outline" title="Preferencias" theme={theme}>
            <View style={styles.preferenceCard}>
              <View style={styles.preferenceHeader}>
                <View
                  style={[
                    styles.preferenceIcon,
                    { backgroundColor: theme.rowAlt },
                  ]}
                >
                  <Ionicons
                    name="contrast-outline"
                    size={18}
                    color={theme.blue}
                  />
                </View>
                <View style={styles.preferenceTextWrap}>
                  <Text style={[styles.preferenceTitle, { color: theme.text }]}>
                    Apariencia
                  </Text>
                  <Text
                    style={[styles.preferenceSubtitle, { color: theme.muted }]}
                  >
                    {colorModeLabel}
                  </Text>
                </View>
              </View>

              <ThemeModeSelector
                activeMode={colorMode}
                blueColor={theme.blue}
                borderColor={theme.border}
                labels={{ system: "Sistema", dark: "Oscuro", light: "Claro" }}
                onPrimaryColor={theme.onPrimary}
                onChange={setColorMode}
                rowColor={theme.row}
              />
              <ColorPaletteSelector
                activePalette={colorPalette}
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

            <Row
              icon="language-outline"
              title="Idioma"
              description={languageLabel}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/language",
                  params: { from: "profile" },
                })
              }
              theme={theme}
            />
          </Section>

          <Section icon="help-circle-outline" title="Ayuda" theme={theme}>
            <Row
              icon="help-circle-outline"
              title="Centro de ayuda"
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/help",
                  params: { from: "profile" },
                })
              }
              theme={theme}
            />
            <Row
              icon="alert-circle-outline"
              title={t("profile.reportProblem")}
              onPress={() => showPending(t("profile.reportProblem"))}
              theme={theme}
            />
            <Row
              icon="information-circle-outline"
              title="Acerca de Smart Home"
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/about-smart-home",
                  params: { from: "profile" },
                })
              }
              theme={theme}
            />
          </Section>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("action.logout")}
            onPress={confirmLogout}
            style={({ pressed }) => [
              styles.logout,
              {
                backgroundColor: theme.dangerSoft,
                borderColor: theme.dangerSoft,
              },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="log-out-outline" size={21} color={theme.danger} />
            <Text style={[styles.logoutText, { color: theme.danger }]}>
              {t("action.logout")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
