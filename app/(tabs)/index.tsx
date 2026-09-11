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
  featured?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  theme: ThemeLike;
  title: string;
};

function QuickCard({
  description,
  featured = false,
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
        featured && styles.quickCardFeatured,
        { backgroundColor: theme.card, borderColor: theme.borderLight },
        pressed && styles.pressed,
      ]}
    >
      {featured ? (
        <>
          <View style={styles.featuredCopy}>
            <View style={styles.featuredTitleRow}>
              <View
                style={[styles.quickIcon, { backgroundColor: theme.blue1 }]}
              >
                <Ionicons name={icon} size={25} color={theme.blue} />
              </View>
              <Text style={[styles.featuredTitle, { color: theme.text }]}>
                {title}
              </Text>
            </View>
          </View>
          <View style={styles.featuredArrow}>
            <Ionicons name="chevron-forward" size={18} color={theme.muted} />
          </View>
        </>
      ) : (
        <>
          <View style={styles.quickTopRow}>
            <View style={[styles.quickIcon, { backgroundColor: theme.blue1 }]}>
              <Ionicons name={icon} size={24} color={theme.blue} />
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.muted} />
          </View>
          <Text style={[styles.quickTitle, { color: theme.text }]}>
            {title}
          </Text>
          <Text style={[styles.quickDescription, { color: theme.muted }]}>
            {description}
          </Text>
        </>
      )}
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
  const { devices, homes, resolvedSmartAlerts, sessionName } = useSmartHome();

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
              {
                backgroundColor: theme.card,
                borderColor: theme.borderLight,
              },
            ]}
          >
            <View style={styles.heroHeader}>
              <View style={styles.brandBlock}>
                <Text style={[styles.overline, { color: theme.blue }]}>
                  SMART HOME
                </Text>
                <View style={styles.brandLine} />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Abrir configuración"
                onPress={() => router.push("/(tabs)/settings")}
                style={({ pressed }) => [
                  styles.settingsButton,
                  {
                    backgroundColor: theme.blue1,
                    borderColor: theme.borderLight,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="settings-outline"
                  size={23}
                  color={theme.blue}
                />
              </Pressable>
            </View>

            <View style={styles.heroTitleBlock}>
              <Text style={[styles.greeting, { color: "#0F172A" }]}>
                Hola, {sessionName}
              </Text>
              <Text style={[styles.subtitle, { color: "#4B5A67" }]}>
                Tu hogar, más inteligente.
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <View
                style={[styles.summaryCard, { backgroundColor: theme.blue1 }]}
              >
                <View
                  style={[
                    styles.summaryIconWrap,
                    { backgroundColor: theme.card },
                  ]}
                >
                  <Ionicons name="watch-outline" size={22} color={theme.blue} />
                </View>
                <Text style={[styles.summaryValue, { color: "#0F172A" }]}>
                  {activeDeviceCount}
                </Text>
                <Text style={[styles.summaryLabel, { color: "#4B5A67" }]}>
                  dispositivos activos
                </Text>
              </View>

              <View
                style={[styles.summaryCard, { backgroundColor: theme.blue1 }]}
              >
                <View
                  style={[
                    styles.summaryIconWrap,
                    { backgroundColor: theme.card },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={22}
                    color={theme.blue}
                  />
                </View>
                <Text style={[styles.summaryValue, { color: "#0F172A" }]}>
                  Hogar seguro
                </Text>
                <Text style={[styles.summaryLabel, { color: "#4B5A67" }]}>
                  Sin alertas pendientes
                </Text>
              </View>
            </View>
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
              description={`${favoriteHomes} ${favoriteHomes === 1 ? "guardado" : "guardados"}`}
              onPress={() => router.push("/(tabs)/favorites")}
              theme={theme}
              featured
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
  hero: {
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  heroHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  brandBlock: {
    alignItems: "flex-start",
    flex: 1,
  },
  overline: {
    fontFamily: typography.fontFamily.display,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  brandLine: {
    backgroundColor: "#0047AB",
    borderRadius: 999,
    height: 3,
    marginTop: 7,
    width: 96,
  },
  heroTitleBlock: {
    marginTop: 14,
  },
  greeting: {
    fontFamily: typography.fontFamily.display,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },
  settingsButton: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  identityRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 18,
    marginBottom: 10,
  },
  avatar: {
    alignItems: "center",
    borderRadius: 32,
    borderWidth: 1,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  avatarText: {
    fontFamily: typography.fontFamily.display,
    fontSize: 30,
    fontWeight: "900",
  },
  identityCopy: { flex: 1, marginLeft: 12 },
  identityName: { fontFamily: appFont, fontSize: 18, fontWeight: "900" },
  identityRole: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  statusRow: { alignItems: "center", flexDirection: "row", marginTop: 7 },
  statusDot: { borderRadius: 5, height: 9, marginRight: 6, width: 9 },
  statusText: { fontFamily: appFont, fontSize: 11, fontWeight: "700" },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    marginBottom: 2,
  },
  summaryCard: {
    borderRadius: 18,
    flex: 1,
    minHeight: 104,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  summaryIconWrap: {
    alignItems: "center",
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  summaryValue: {
    fontFamily: typography.fontFamily.display,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10,
  },
  summaryLabel: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  editButton: {
    alignItems: "center",
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 60,
    paddingHorizontal: 18,
  },
  editText: {
    color: "#FFFFFF",
    flex: 1,
    fontFamily: appFont,
    fontSize: 19,
    fontWeight: "900",
    marginLeft: 10,
    textAlign: "center",
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
    minHeight: 112,
    padding: 12,
  },
  quickCardFeatured: {
    flexBasis: "100%",
    flexDirection: "row",
    minHeight: 76,
    overflow: "hidden",
    padding: 10,
  },
  featuredCopy: {
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
    zIndex: 2,
  },
  featuredTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  featuredTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 18,
    fontWeight: "900",
  },
  featuredArrow: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    position: "absolute",
    right: 10,
    top: 10,
    width: 22,
    zIndex: 3,
  },
  quickTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
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
