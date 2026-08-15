import { useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CurrentConsumptionCard } from "@/components/dashboard/CurrentConsumptionCard";
import { EnergyAccumulatedCard } from "@/components/dashboard/EnergyAccumulatedCard";
import { ActiveDevicesCard } from "@/components/dashboard/ActiveDevicesCard";
import { ConsumptionChartCard } from "@/components/dashboard/ConsumptionChartCard";
import { HomeSummaryCard } from "@/components/dashboard/HomeSummaryCard";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function DashboardScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();

  const { devices, homes, sessionName, setActiveHomeId } = useSmartHome();

  // Calcular métricas
  const onlineDevices = devices.filter(d => d.online);
  const totalPower = onlineDevices.reduce((sum, d) => sum + (d.state === "on" ? d.power : 0), 0);
  const totalEnergy = onlineDevices.reduce((sum, d) => sum + d.energy, 0);

  // Hogares para mostrar (favoritos o el primero)
  const favoriteHomes = homes.filter(h => h.favorite);
  const displayHomes = favoriteHomes.length ? favoriteHomes : homes.slice(0, 1);

  const showNotifications = () => {
    const critical = devices.find(d => d.critical && d.online);
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
    // Navegar a detalle del dispositivo (aún no implementado)
    Alert.alert("Detalle", `Ver detalle del dispositivo ${deviceId}`);
  };

  // Determinar si el hogar tiene algún dispositivo encendido
  const getHomePower = (homeId: string) => {
    return devices
      .filter(d => d.homeId === homeId && d.online && d.state === "on")
      .reduce((sum, d) => sum + d.power, 0);
  };
  const getHomeDeviceCount = (homeId: string) => {
    return devices.filter(d => d.homeId === homeId && d.online).length;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
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
          <DashboardHeader
            onNotificationsPress={showNotifications}
            onProfilePress={goToProfile}
            sessionName={sessionName}
          />

          <CurrentConsumptionCard power={totalPower} isOn={totalPower > 0} />
          <EnergyAccumulatedCard energy={totalEnergy} />

          <ActiveDevicesCard
            devices={devices}
            onDevicePress={goToDeviceDetail}
            onViewAll={goToHomes}
          />

          <ConsumptionChartCard />

          <View style={styles.homesSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Mi hogar
            </Text>
            {displayHomes.length > 0 ? (
              displayHomes.map(home => (
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
              <EmptyDashboard
                onAddPress={goToHomes}
              />
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
  homesSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
});