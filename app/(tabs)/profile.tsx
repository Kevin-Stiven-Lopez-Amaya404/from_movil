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

import { profileFont } from "@/components/profile/profileTheme";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useTranslation } from "@/lib/i18n/i18n";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

const appFont = profileFont;
type ThemeLike = ReturnType<typeof useAppTheme>;

type RowProps = {
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  theme: ThemeLike;
  title: string;
};

function Row({ description, icon, onPress, theme, title }: RowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.rowIcon, { backgroundColor: theme.rowAlt }]}>
        <Ionicons name={icon} size={20} color={theme.blue} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>
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
  const { devices, resolvedSmartAlerts, sessionName, sessionRole } =
    useSmartHome();

  const pendingAlerts = devices.filter(
    (device) =>
      (device.critical || !device.online) &&
      !resolvedSmartAlerts.includes(device.id),
  ).length;
  const initial = sessionName.trim().charAt(0).toUpperCase() || "U";
  const roleLabel =
    sessionRole === "admin"
      ? "Administrador"
      : sessionRole === "miembro"
        ? "Miembro"
        : "Invitado";

  function showPending(title: string) {
    Alert.alert(title, t("common.readyBackend"), [
      { text: t("action.cancel") },
    ]);
  }

  function confirmLogout() {
    Alert.alert(t("action.logout"), t("profile.logoutPrompt"), [
      { text: t("action.cancel"), style: "cancel" },
      {
        text: t("action.logout"),
        style: "destructive",
        onPress: () => router.replace("/welcome"),
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
            accessibilityRole="button"
            accessibilityLabel="Abrir configuración"
            onPress={() => router.push("/(tabs)/settings")}
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
                pepe@smarthome.com
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
              onPress={() => router.push("/(tabs)/settings")}
              theme={theme}
            />
            <Row
              icon="home-outline"
              title="Mis hogares"
              onPress={() => router.push("/(tabs)/homes")}
              theme={theme}
            />
          </Section>

          <Section icon="lock-closed-outline" title="Seguridad" theme={theme}>
            <Row
              icon="lock-closed-outline"
              title="Cambiar contraseña"
              onPress={() => router.push("/forgot-password")}
              theme={theme}
            />
            <Row
              icon="shield-checkmark-outline"
              title="Seguridad de la cuenta"
              description={`${pendingAlerts} alertas pendientes`}
              onPress={() => router.push("/(tabs)/alerts")}
              theme={theme}
            />
          </Section>

          <Section icon="options-outline" title="Preferencias" theme={theme}>
            <Row
              icon="notifications-outline"
              title="Notificaciones"
              onPress={() => router.push("/(tabs)/alerts")}
              theme={theme}
            />
            <Row
              icon="contrast-outline"
              title="Apariencia"
              onPress={() => router.push("/(tabs)/settings")}
              theme={theme}
            />
            <Row
              icon="language-outline"
              title="Idioma"
              onPress={() => router.push("/(tabs)/settings")}
              theme={theme}
            />
          </Section>

          <Section icon="help-circle-outline" title="Ayuda" theme={theme}>
            <Row
              icon="help-circle-outline"
              title="Centro de ayuda"
              onPress={() => router.push("/(tabs)/help")}
              theme={theme}
            />
            <Row
              icon="information-circle-outline"
              title="Acerca de Smart Home"
              onPress={() => showPending("Acerca de Smart Home")}
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

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { alignSelf: "center", width: "100%" },
  identityCard: {
    alignItems: "center",
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 17,
    padding: 13,
  },
  avatar: {
    alignItems: "center",
    borderRadius: 34,
    borderWidth: 1,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  avatarText: { fontFamily: appFont, fontSize: 27, fontWeight: "900" },
  identityCopy: { flex: 1, marginHorizontal: 12 },
  identityName: { fontFamily: appFont, fontSize: 17, fontWeight: "900" },
  identityEmail: { fontFamily: appFont, fontSize: 12, marginTop: 3 },
  rolePill: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 12,
    flexDirection: "row",
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleText: {
    fontFamily: appFont,
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 4,
  },
  section: { marginBottom: 15 },
  sectionHeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  sectionTitle: { fontFamily: appFont, fontSize: 14, fontWeight: "900" },
  rows: {
    borderRadius: 15,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 9,
  },
  row: {
    alignItems: "center",
    borderTopColor: "#E2E8F0",
    borderTopWidth: 1,
    flexDirection: "row",
    minHeight: 56,
    paddingVertical: 8,
  },
  rowIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  rowCopy: { flex: 1, marginHorizontal: 10 },
  rowTitle: { fontFamily: appFont, fontSize: 13, fontWeight: "800" },
  rowDescription: { fontFamily: appFont, fontSize: 10, marginTop: 2 },
  logout: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 48,
    marginBottom: 8,
  },
  logoutText: {
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },
  pressed: { opacity: 0.72 },
});
