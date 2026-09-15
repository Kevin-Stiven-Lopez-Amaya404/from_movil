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

import { ProfileMenuItem } from "@/components/profile/ProfileMenuItem";
import { ProfileModule } from "@/components/profile/ProfileModule";
import { ProfileShortcutCard } from "@/components/profile/ProfileShortcutCard";
import { profileFont } from "@/components/profile/profileTheme";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useTranslation } from "@/lib/i18n/i18n";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

const appFont = profileFont;

type ThemeLike = ReturnType<typeof useAppTheme>;

export default function ProfileScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { t } = useTranslation();
  const {
    activeHomeId,
    devices,
    homes,
    lastSync,
    refreshSync,
    resolvedSmartAlerts,
    sessionName,
  } = useSmartHome();

  const onlineDevices = devices.filter((device) => device.online).length;
  const activeDeviceCount = devices.filter(
    (device) => device.online && device.state === "on",
  ).length;
  const smartHomeAlerts = devices.filter(
    (device) =>
      (device.critical || !device.online) &&
      !resolvedSmartAlerts.includes(device.id),
  ).length;
  const favoriteHomes = homes.filter((home) => home.favorite).length;
  const activeHome =
    homes.find((home) => home.id === activeHomeId) ?? homes[0] ?? null;
  const initial = sessionName.trim().charAt(0).toUpperCase() || "U";

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
          <View
            style={[
              styles.profileHero,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <View style={styles.heroTopRow}>
              <View>
                <Text style={[styles.overline, { color: theme.blue }]}>
                  SMART HOME
                </Text>
                <Text style={[styles.heroTitle, { color: theme.text }]}>
                  {t("profile.greeting", { name: sessionName })}
                </Text>
                <Text style={[styles.heroSubtitle, { color: theme.muted }]}>
                  {t("profile.accountModuleSubtitle")}
                </Text>
              </View>
              <Pressable
                onPress={() => router.push("/(tabs)/settings")}
                style={({ pressed }) => [
                  styles.iconButton,
                  {
                    backgroundColor: theme.rowAlt,
                    borderColor: theme.borderLight,
                  },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t("settings.title")}
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
                <Text
                  numberOfLines={1}
                  style={[styles.profileName, { color: theme.text }]}
                >
                  {sessionName}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.profileEmail, { color: theme.muted }]}
                >
                  {t("profile.accountModule")}
                </Text>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: theme.success },
                    ]}
                  />
                  <Text style={[styles.statusText, { color: theme.muted }]}>
                    {t("profile.activeDevices", { count: activeDeviceCount })}
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              onPress={() => router.push("/(tabs)/settings")}
              style={({ pressed }) => [
                styles.editButton,
                { backgroundColor: theme.blue },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
            >
              <Ionicons name="create-outline" size={17} color="#FFFFFF" />
              <Text style={styles.editButtonText}>{t("profile.editInfo")}</Text>
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <StatCard
              icon="home-outline"
              label={t("profile.manageHomes")}
              value={String(homes.length)}
              theme={theme}
            />
            <StatCard
              icon="hardware-chip-outline"
              label={t("profile.activeDevices", { count: activeDeviceCount })}
              value={String(activeDeviceCount)}
              theme={theme}
            />
            <StatCard
              icon="notifications-outline"
              label={t(
                smartHomeAlerts === 1
                  ? "common.pendingAlert"
                  : "common.pendingAlerts",
                { count: smartHomeAlerts },
              )}
              value={String(smartHomeAlerts)}
              theme={theme}
            />
          </View>

          <Pressable
            onPress={() => router.push("/(tabs)/homes")}
            style={({ pressed }) => [
              styles.homeCard,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.homeIcon, { backgroundColor: theme.rowAlt }]}>
              <Ionicons name="home-outline" size={23} color={theme.blue} />
            </View>
            <View style={styles.homeCopy}>
              <Text style={[styles.homeLabel, { color: theme.blue }]}>
                {t("profile.accountHome", {
                  name: sessionName,
                  count: homes.length,
                })}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.homeName, { color: theme.text }]}
              >
                {activeHome?.name ?? t("profile.noHomeConfigured")}
              </Text>
              <Text style={[styles.homeDescription, { color: theme.muted }]}>
                {homes.length}{" "}
                {homes.length === 1
                  ? t("profile.homeAvailable")
                  : t("profile.homesAvailable")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.muted} />
          </Pressable>

          <View style={styles.sectionHeading}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t("profile.quickAccess")}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.muted }]}>
              {t("profile.quickAccessSubtitle")}
            </Text>
          </View>
          <View style={styles.shortcutsGrid}>
            <ProfileShortcutCard
              icon="home-outline"
              title={t("profile.myHomes")}
              description={t("profile.availableCount", { count: homes.length })}
              onPress={() => router.push("/(tabs)/homes")}
            />
            <ProfileShortcutCard
              icon="hardware-chip-outline"
              title={t("profile.devices")}
              description={t("profile.connectedCount", {
                count: onlineDevices,
              })}
              onPress={() => router.push("/(tabs)/devices")}
            />
            <ProfileShortcutCard
              icon="bar-chart-outline"
              title={t("profile.consumption")}
              description={t("profile.consumptionDescription")}
              onPress={() => router.push("/(tabs)/reports")}
            />
            <ProfileShortcutCard
              icon="notifications-outline"
              title={t("profile.alerts")}
              description={
                smartHomeAlerts
                  ? `${smartHomeAlerts} pendiente${smartHomeAlerts === 1 ? "" : "s"}`
                  : t("profile.noAlerts")
              }
              onPress={() => router.push("/(tabs)/alerts")}
            />
            <ProfileShortcutCard
              icon="star-outline"
              title={t("profile.favorites")}
              description={t("profile.savedCount", { count: favoriteHomes })}
              onPress={() => router.push("/(tabs)/favorites")}
            />
            <ProfileShortcutCard
              icon="sync-outline"
              title={t("profile.sync")}
              description={t("profile.lastSync", { value: lastSync })}
              onPress={refreshSync}
            />
          </View>

          <ProfileModule
            title={t("profile.accountModule")}
            subtitle={t("profile.accountModuleSubtitle")}
          >
            <ProfileMenuItem
              icon="person-outline"
              title={t("profile.editInfo")}
              onPress={() => router.push("/(tabs)/settings")}
            />
            <ProfileMenuItem
              icon="home-outline"
              title={t("profile.manageHomes")}
              onPress={() => router.push("/(tabs)/homes")}
            />
          </ProfileModule>

          <ProfileModule title={t("profile.session")}>
            <ProfileMenuItem
              icon="log-out-outline"
              intent="danger"
              title={t("action.logout")}
              onPress={confirmLogout}
            />
          </ProfileModule>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  theme: ThemeLike;
};

function StatCard({ icon, label, value, theme }: StatCardProps) {
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: theme.card, borderColor: theme.borderLight },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: theme.rowAlt }]}>
        <Ionicons name={icon} size={18} color={theme.blue} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text
        numberOfLines={2}
        style={[styles.statLabel, { color: theme.muted }]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { alignSelf: "center", width: "100%" },
  profileHero: {
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 12,
    padding: 18,
  },
  heroTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overline: {
    fontFamily: appFont,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontFamily: appFont,
    fontSize: 25,
    fontWeight: "900",
    marginTop: 5,
  },
  heroSubtitle: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },
  iconButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  identityRow: { alignItems: "center", flexDirection: "row", marginTop: 22 },
  avatar: {
    alignItems: "center",
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  avatarText: { fontFamily: appFont, fontSize: 24, fontWeight: "900" },
  identityCopy: { flex: 1, marginLeft: 12 },
  profileName: { fontFamily: appFont, fontSize: 18, fontWeight: "900" },
  profileEmail: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  statusRow: { alignItems: "center", flexDirection: "row", marginTop: 7 },
  statusDot: { borderRadius: 5, height: 9, marginRight: 6, width: 9 },
  statusText: { fontFamily: appFont, fontSize: 11, fontWeight: "700" },
  editButton: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
    minHeight: 44,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 7,
  },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCard: {
    borderRadius: 15,
    borderWidth: 1,
    flex: 1,
    minHeight: 108,
    padding: 10,
  },
  statIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  statValue: {
    fontFamily: appFont,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 8,
  },
  statLabel: {
    fontFamily: appFont,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  homeCard: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 20,
    padding: 13,
  },
  homeIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 45,
    justifyContent: "center",
    width: 45,
  },
  homeCopy: { flex: 1, marginHorizontal: 11 },
  homeLabel: { fontFamily: appFont, fontSize: 11, fontWeight: "800" },
  homeName: {
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 3,
  },
  homeDescription: {
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  sectionHeading: { marginBottom: 11 },
  sectionTitle: { fontFamily: appFont, fontSize: 18, fontWeight: "900" },
  sectionSubtitle: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  shortcutsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pressed: { opacity: 0.72 },
});
