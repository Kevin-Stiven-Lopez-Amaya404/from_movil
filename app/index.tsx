import { useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActiveDevicesCard } from "@/components/dashboard/ActiveDevicesCard";
import { CurrentConsumptionCard } from "@/components/dashboard/CurrentConsumptionCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";
import { EnergyAccumulatedCard } from "@/components/dashboard/EnergyAccumulatedCard";
import { HomeSummaryCard } from "@/components/dashboard/HommeSummaryCard";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const theme = useAppTheme();

  const { devices, homes, sessionName, setActiveHomeId } = useSmartHome();

  /* ------------------------------------------------------------------------ */
  /* Métricas globales                                                        */
  /* ------------------------------------------------------------------------ */

  const onlineDevices = devices.filter((device) => device.online);

  const activeDevices = onlineDevices.filter(
    (device) => device.state === "on" && device.power > 0,
  );

  const totalPower = activeDevices.reduce(
    (sum, device) => sum + device.power,
    0,
  );

  const totalEnergy = onlineDevices.reduce(
    (sum, device) => sum + device.energy,
    0,
  );

  const yesterdayEnergy = onlineDevices.reduce(
    (sum, device) => sum + device.yesterday,
    0,
  );

  /* ------------------------------------------------------------------------ */
  /* Hogares                                                                  */
  /* ------------------------------------------------------------------------ */

  const favoriteHomes = homes.filter((home) => home.favorite);

  const displayHomes =
    favoriteHomes.length > 0 ? favoriteHomes : homes.slice(0, 1);

  /* ------------------------------------------------------------------------ */
  /* Navegación                                                               */
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
  /* Notificaciones                                                           */
  /* ------------------------------------------------------------------------ */

  const showNotifications = () => {
    const criticalDevice = devices.find(
      (device) => device.critical && device.online,
    );

    Alert.alert(
      criticalDevice ? "Ahorro recomendado" : "Todo en orden",
      criticalDevice
        ? `${criticalDevice.name} está consumiendo más de lo habitual.`
        : "No hay alertas activas en tus dispositivos.",
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Métricas por hogar                                                       */
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
  /* Layout responsive                                                        */
  /* ------------------------------------------------------------------------ */

  const isTablet = width >= 768;
  const horizontalPadding = isTablet ? 24 : 16;

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
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <View style={[styles.content, isTablet && styles.contentTablet]}>
          {/* ---------------------------------------------------------------- */}
          {/* Encabezado                                                       */}
          {/* ---------------------------------------------------------------- */}

          <DashboardHeader
            userName={sessionName || "Usuario"}
            onNotificationsPress={showNotifications}
            onProfilePress={goToProfile}
          />

          {/* ---------------------------------------------------------------- */}
          {/* Resumen energético                                               */}
          {/* ---------------------------------------------------------------- */}

          <View style={styles.metricsSection}>
            <View style={styles.metricsRow}>
              <CurrentConsumptionCard
                power={totalPower}
                isOn={totalPower > 0}
              />

              <EnergyAccumulatedCard
                energy={totalEnergy}
                yesterdayEnergy={yesterdayEnergy}
              />
            </View>
          </View>

          {/* ---------------------------------------------------------------- */}
          {/* Dispositivos activos                                             */}
          {/* ---------------------------------------------------------------- */}

          <ActiveDevicesCard
            devices={devices}
            onDevicePress={goToDeviceDetail}
            onViewAll={goToHomes}
          />

          {/* ---------------------------------------------------------------- */}
          {/* Hogares                                                           */}
          {/* ---------------------------------------------------------------- */}

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

/* -------------------------------------------------------------------------- */
/* Estilos                                                                    */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    alignItems: "center",
    paddingBottom: 120,
  },

  content: {
    alignSelf: "center",
    width: "100%",
  },

  contentTablet: {
    maxWidth: 900,
  },

  metricsSection: {
    width: "100%",
  },

  metricsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  homesSection: {
    marginTop: 20,
    width: "100%",
  },

  sectionHeader: {
    marginBottom: 4,
  },

  sectionTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.size.section,
    fontWeight: typography.weight.bold,
  },

  sectionSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.helper,
    marginTop: 2,
  },
});
