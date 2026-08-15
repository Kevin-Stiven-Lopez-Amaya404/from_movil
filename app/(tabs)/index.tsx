import { useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CurrentConsumptionCard } from "@/components/dashboard/CurrentConsumptionCard";
import { EnergyAccumulatedCard } from "@/components/dashboard/EnergyAccumulatedCard";
import { ActiveDevicesCard } from "@/components/dashboard/ActiveDevicesCard";
import { HomeSummaryCard } from "@/components/dashboard/HommeSummaryCard";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const theme = useAppTheme();
  const { devices, homes, sessionName, setActiveHomeId } = useSmartHome();

  // Calcular métricas
  const onlineDevices = devices.filter((d) => d.online);
  const totalPower = onlineDevices.reduce(
    (sum, d) => sum + (d.state === "on" ? d.power : 0),
    0
  );
  const totalEnergy = onlineDevices.reduce((sum, d) => sum + d.energy, 0);

  // Calcular energía de ayer
  const yesterdayEnergy = 10.5;

  // Hogares a mostrar
  const favoriteHomes = homes.filter((h) => h.favorite);
  const displayHomes = favoriteHomes.length ? favoriteHomes : homes.slice(0, 1);

  const showNotifications = () => {
    const critical = devices.find((d) => d.critical && d.online);
    Alert.alert(
      critical ? "Ahorro recomendado" : "Todo en orden",
      critical
        ? `${critical.name} está consumiendo más de lo habitual.`
        : "No hay alertas activas en tus dispositivos."
    );
  };

  const goToHomes = () => router.push("/(tabs)/homes");
  const goToProfile = () => router.push("/profile");
  const goToDeviceDetail = (deviceId: string) => {
    Alert.alert("Detalle", `Ver detalle del dispositivo ${deviceId}`);
  };

  // Métricas del hogar
  const getHomePower = (homeId: string) => {
    return devices
      .filter((d) => d.homeId === homeId && d.online && d.state === "on")
      .reduce((sum, d) => sum + d.power, 0);
  };

  const getHomeDeviceCount = (homeId: string) => {
    return devices.filter((d) => d.homeId === homeId && d.online).length;
  };

  const gutter = width > 600 ? 24 : 16;
  const paddingBottom = 112;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.blue1}]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: gutter,
            paddingBottom: paddingBottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Cabecera con card azul e íconos distribuidos */}
          <DashboardHeader
            userName={sessionName || "Natalia"}
            onNotificationsPress={showNotifications}
            onProfilePress={goToProfile}
          />

          {/* Fila con las métricas alineadas a la misma altura */}
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

          {/* Tarjeta de Dispositivos Activos */}
          <ActiveDevicesCard
            devices={devices}
            onDevicePress={goToDeviceDetail}
            onViewAll={goToHomes}
          />

          {/* Sección Mi Hogar */}
          <View style={styles.homesSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              🏠 Mi Hogar
            </Text>
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
    minHeight: "100%",
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginVertical: 8,
  },
  homesSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: typography.size.section,
    fontWeight: typography.weight.semibold,
    marginBottom: 8,
  },
});