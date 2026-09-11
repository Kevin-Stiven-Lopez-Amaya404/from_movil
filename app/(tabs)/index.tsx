import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

const appFont = typography.fontFamily.emphasis;

type ThemeLike = ReturnType<typeof useAppTheme>;

type QuickCardProps = {
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  theme: ThemeLike;
  title: string;
};

function QuickCard({
  description,
  icon,
  onPress,
  theme,
  title,
}: QuickCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickCard,
        { backgroundColor: theme.card, borderColor: theme.borderLight },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.quickIcon, { backgroundColor: theme.blue1 }]}>
        <Ionicons name={icon} size={24} color={theme.blue} />
      </View>
      <Text style={[styles.quickTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.quickDescription, { color: theme.muted }]}>
        {description}
      </Text>
    </Pressable>
  );
}

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  theme: ThemeLike;
  value: number;
};

function StatCard({ icon, label, theme, value }: StatCardProps) {
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: theme.card, borderColor: theme.borderLight },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: theme.blue1 }]}>
        <Ionicons name={icon} size={18} color={theme.blue} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const {
    devices,
    homes,
    lastSync,
    refreshSync,
    resolvedSmartAlerts,
    sessionName,
  } = useSmartHome();

  const activeDeviceCount = devices.filter(
    (device) => device.online && device.state === "on",
  ).length;
  const onlineDeviceCount = devices.filter((device) => device.online).length;
  const pendingAlerts = devices.filter(
    (device) =>
      (device.critical || !device.online) &&
      !resolvedSmartAlerts.includes(device.id),
  ).length;
  const favoriteHomes = homes.filter((home) => home.favorite).length;
  const initial = sessionName.trim().charAt(0).toUpperCase() || "U";

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
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
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <View
            style={[
              styles.hero,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <View style={styles.heroHeader}>
              <View>
                <Text style={[styles.overline, { color: theme.blue }]}>
                  SMART HOME
                </Text>
                <Text style={[styles.greeting, { color: theme.text }]}>
                  Hola, {sessionName}
                </Text>
                <Text style={[styles.subtitle, { color: theme.muted }]}>
                  Perfil, hogares, mensajes y soporte.
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Abrir configuración"
                onPress={() => router.push("/(tabs)/settings")}
                style={({ pressed }) => [
                  styles.settingsButton,
                  {
                    backgroundColor: theme.rowAlt,
                    borderColor: theme.borderLight,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="settings-outline"
                  size={21}
                  color={theme.text}
                />
              </Pressable>
            </View>

            <View style={styles.identityRow}>
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
                <Text style={[styles.identityRole, { color: theme.muted }]}>
                  Cuenta y hogares
                </Text>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: theme.success },
                    ]}
                  />
                  <Text style={[styles.statusText, { color: theme.muted }]}>
                    {activeDeviceCount} dispositivos activos
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Editar información de perfil"
              onPress={() => router.push("/(tabs)/profile")}
              style={({ pressed }) => [
                styles.editButton,
                { backgroundColor: theme.blue },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="create-outline" size={17} color="#FFFFFF" />
              <Text style={styles.editText}>Editar información de perfil</Text>
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <StatCard
              icon="home-outline"
              label="Administrar hogares"
              theme={theme}
              value={homes.length}
            />
            <StatCard
              icon="hardware-chip-outline"
              label={`${onlineDeviceCount} dispositivos activos`}
              theme={theme}
              value={activeDeviceCount}
            />
            <StatCard
              icon="notifications-outline"
              label={`${pendingAlerts} alertas pendientes`}
              theme={theme}
              value={pendingAlerts}
            />
          </View>

          <View style={styles.quickHeader}>
            <Text style={[styles.quickHeading, { color: theme.text }]}>
              Tus accesos rápidos
            </Text>
            <Text style={[styles.quickSubtitle, { color: theme.muted }]}>
              Funciones principales de Smart Home
            </Text>
          </View>

          <View style={styles.quickGrid}>
            <QuickCard
              icon="home-outline"
              title="Mis hogares"
              description={`${homes.length} disponibles`}
              onPress={() => router.push("/(tabs)/homes")}
              theme={theme}
            />
            <QuickCard
              icon="hardware-chip-outline"
              title="Dispositivos"
              description={`${onlineDeviceCount} conectados`}
              onPress={() => router.push("/(tabs)/devices")}
              theme={theme}
            />
            <QuickCard
              icon="bar-chart-outline"
              title="Consumo"
              description="Consulta tus reportes"
              onPress={() => router.push("/(tabs)/reports")}
              theme={theme}
            />
            <QuickCard
              icon="notifications-outline"
              title="Alertas"
              description={`${pendingAlerts} pendientes`}
              onPress={() => router.push("/(tabs)/alerts")}
              theme={theme}
            />
            <QuickCard
              icon="star-outline"
              title="Favoritos"
              description={`${favoriteHomes} guardados`}
              onPress={() => router.push("/(tabs)/favorites")}
              theme={theme}
            />
            <QuickCard
              icon="sync-outline"
              title="Sincronizar"
              description={`Última: ${lastSync}`}
              onPress={refreshSync}
              theme={theme}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { alignItems: "center" },
  content: { alignSelf: "center", width: "100%" },
  hero: { borderRadius: 20, borderWidth: 1, marginBottom: 12, padding: 14 },
  heroHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overline: {
    fontFamily: appFont,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  greeting: {
    fontFamily: typography.fontFamily.display,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 4,
  },
  subtitle: {
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },
  settingsButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  identityRow: { alignItems: "center", flexDirection: "row", marginTop: 18 },
  avatar: {
    alignItems: "center",
    borderRadius: 27,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  avatarText: {
    fontFamily: typography.fontFamily.display,
    fontSize: 24,
    fontWeight: "900",
  },
  identityCopy: { flex: 1, marginLeft: 11 },
  identityName: { fontFamily: appFont, fontSize: 17, fontWeight: "900" },
  identityRole: {
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  statusRow: { alignItems: "center", flexDirection: "row", marginTop: 5 },
  statusDot: { borderRadius: 5, height: 8, marginRight: 5, width: 8 },
  statusText: { fontFamily: appFont, fontSize: 10, fontWeight: "700" },
  editButton: {
    alignItems: "center",
    borderRadius: 11,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 17,
    minHeight: 41,
  },
  editText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 13 },
  statCard: {
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 100,
    padding: 9,
  },
  statIcon: {
    alignItems: "center",
    borderRadius: 9,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  statValue: {
    fontFamily: typography.fontFamily.display,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 7,
  },
  statLabel: {
    fontFamily: appFont,
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
  },
  quickHeader: { marginBottom: 10 },
  quickHeading: {
    fontFamily: typography.fontFamily.display,
    fontSize: 18,
    fontWeight: "900",
  },
  quickSubtitle: {
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickCard: {
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: "48%",
    flexGrow: 1,
    minHeight: 124,
    padding: 12,
  },
  quickIcon: {
    alignItems: "center",
    borderRadius: 11,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  quickTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 11,
  },
  quickDescription: {
    fontFamily: appFont,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
  },
  pressed: { opacity: 0.72 },
});
