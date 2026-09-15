import { useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActiveDevicesCard } from "@/components/dashboard/ActiveDevicesCard";
import { CurrentConsumptionCard } from "@/components/dashboard/CurrentConsumptionCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";
import { EnergyAccumulatedCard } from "@/components/dashboard/EnergyAccumulatedCard";
import { HomeConsumptionGoalCard } from "@/components/dashboard/HomeConsumptionGoalCard";
import { HomeSummaryCard } from "@/components/dashboard/HommeSummaryCard";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
import { getHouseConsumption } from "@/lib/utils/consumption";

export default function DashboardScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();

  const {
    devices,
    homes,
    resolvedSmartAlerts,
    sessionName,
    activeHomeId,
    setActiveHomeId,
    homeConsumptionGoals,
  } = useSmartHome();

  /* ------------------------------------------------------------------------ */
  /* Métricas                                                                  */
  /* ------------------------------------------------------------------------ */

  const activeHome = homes.find((home) => home.id === activeHomeId) ?? homes[0];
  const activeHomeDevices = activeHome
    ? devices.filter((device) => device.homeId === activeHome.id)
    : [];
  const onlineDevices = activeHomeDevices.filter((device) => device.online);

  const activeDevices = onlineDevices.filter(
    (device) => device.state === "on" && device.power > 0,
  );

  const totalPower = activeDevices.reduce(
    (sum, device) => sum + device.power,
    0,
  );

  const totalEnergy = activeHome ? getHouseConsumption(devices, activeHome.id) : 0;

  const yesterdayEnergy = onlineDevices.reduce(
    (sum, device) => sum + device.yesterday,
    0,
  );

  /* ------------------------------------------------------------------------ */
  /* Hogar activo                                                              */
  /* ------------------------------------------------------------------------ */

  const favoriteHomes = homes.filter((home) => home.favorite);

  const displayHomes =
    favoriteHomes.length > 0 ? favoriteHomes : homes.slice(0, 1);

  /* ------------------------------------------------------------------------ */
  /* Navegación                                                                */
  /* ------------------------------------------------------------------------ */

  const goToHomes = () => {
    router.push("/(tabs)/homes");
  };

  const goToProfile = () => {
    router.push("/(tabs)/profile");
  };

  const goToDeviceDetail = (deviceId: string) => {
    const device = devices.find((item) => item.id === deviceId);

    if (!device) {
      return;
    }

    Alert.alert(device.name, `${device.room}\n${device.power} W`);
  };

  /* ------------------------------------------------------------------------ */
  /* Notificaciones                                                            */
  /* ------------------------------------------------------------------------ */

  const showNotifications = () => {
    router.push("/(tabs)/alerts");
  };

  const pendingAlerts = devices.filter(
    (device) =>
      (device.critical || !device.online) &&
      !resolvedSmartAlerts.includes(device.id),
  ).length;

  /* ------------------------------------------------------------------------ */
  /* Métricas por hogar                                                        */
  /* ------------------------------------------------------------------------ */

  const getHomePower = (homeId: string) => {
    return devices
      .filter(
        (device) =>
          device.homeId === homeId && device.online && device.state === "on",
      )
      .reduce((sum, device) => sum + device.power, 0);
  };

  const getHomeDeviceCount = (homeId: string) => {
    return devices.filter((device) => device.homeId === homeId && device.online)
      .length;
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

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
          {/* Header */}
          <DashboardHeader
            userName={sessionName || "Usuario"}
            activeHomeName={activeHome?.name ?? "Sin hogar"}
            activeHomeLocation={
              activeHome?.location ?? "Configura tu primer hogar"
            }
            onHomePress={goToHomes}
            onNotificationsPress={showNotifications}
            onProfilePress={goToProfile}
            hasUnreadNotifications={pendingAlerts > 0}
          />

          {/* Resumen energético */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Resumen energético
            </Text>

            <View
              style={[styles.metricsRow, layout.narrow && styles.metricsColumn]}
            >
              <CurrentConsumptionCard
                power={totalPower}
                isOn={totalPower > 0}
              />

              <EnergyAccumulatedCard
                energy={totalEnergy}
                yesterdayEnergy={yesterdayEnergy}
              />
            </View>

            {activeHome && (
              <HomeConsumptionGoalCard
                consumedWh={totalEnergy}
                targetWh={homeConsumptionGoals[activeHome.id] ?? 5000}
              />
            )}
          </View>

          {/* Dispositivos */}
          <ActiveDevicesCard
            devices={activeHomeDevices}
            onDevicePress={goToDeviceDetail}
            onViewAll={goToHomes}
          />

          {/* Hogares */}
          <View style={styles.homesSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  Mis hogares
                </Text>

                <Text
                  style={[
                    styles.sectionSubtitle,
                    {
                      color: theme.muted,
                    },
                  ]}
                >
                  Acceso rápido a tus espacios
                </Text>
              </View>

              <Text
                style={[
                  styles.homeCount,
                  {
                    color: theme.blue,
                  },
                ]}
              >
                {homes.length}
              </Text>
            </View>

            {displayHomes.length > 0 ? (
              displayHomes.map((home) => (
                <HomeSummaryCard
                  key={home.id}
                  name={home.name}
                  power={getHomePower(home.id)}
                  deviceCount={getHomeDeviceCount(home.id)}
                  onPress={() => {
                    setActiveHomeId(home.id);
                    goToHomes();
                  }}
                />
              ))
            ) : (
              <EmptyDashboard onAddPress={goToHomes} />
            )}
          </View>
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

  section: {
    marginTop: 22,
  },

  sectionTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 19,
    fontWeight: typography.weight.bold,
  },

  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    width: "100%",
  },

  metricsColumn: {
    flexDirection: "column",
  },

  homesSection: {
    marginTop: 24,
    width: "100%",
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sectionSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    marginTop: 3,
  },

  homeCount: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
    fontWeight: typography.weight.bold,
  },
});
