/**
 * Pantalla del dashboard principal.
 *
 * Combina las metricas de consumo, las notificaciones y el acceso rapido a
 * hogares favoritos. Utiliza componentes visuales reutilizables para mantener
 * el archivo de pantalla legible y separado de la logica de presentacion.
 */
import { useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { DashboardToolbar } from "@/components/dashboard/DashboardToolbar";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";
import { EnergySummaryCard } from "@/components/dashboard/EnergySummaryCard";
import { HomeWidgetCard } from "@/components/dashboard/HomeWidgetCard";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { formatKwh } from "@/lib/utils/formatters";

const DARK = "#FFFFFF";

export default function DashboardScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();

  // Datos globales usados para construir el resumen del dashboard.
  const { devices, homes, sessionName, setActiveHomeId } = useSmartHome();

  // El dashboard no guarda estos datos: los deriva del estado global.
  const onlineDevices = devices.filter((device) => device.online);
  const currentConsumption = onlineDevices.reduce((total, device) => total + device.consumption, 0);
  const favoriteHomes = homes.filter((home) => home.favorite);

  // El dashboard muestra hogares favoritos si existen;
  // de lo contrario muestra el primer hogar disponible.
  const dashboardHomes = favoriteHomes.length ? favoriteHomes : homes.slice(0, 1);

  /**
   * Muestra una alerta de estado general.
   *
   * Si existe un dispositivo critico encendido, recomienda ahorro. Si no,
   * informa que no hay alertas activas.
   */
  function showNotifications() {
    const critical = devices.find((device) => device.critical && device.online);

    Alert.alert(
      critical ? "Ahorro recomendado" : "Todo en orden",
      critical
        ? `${critical.name} esta consumiendo mas de lo habitual.`
        : "No hay alertas activas en tus dispositivos.",
    );
  }

  function openHomes() {
    router.push("/(tabs)/homes");
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
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
            onProfilePress={() => router.push("/profile")}
            rowAltColor={theme.rowAlt}
            sessionName={sessionName}
            textColor={theme.text}
          />

          <DashboardTabs
            activeKey="dashboard"
            items={[
              { key: "activity", label: "Actividad", route: "/(tabs)/reports" },
              { key: "dashboard", label: "Mi dashboard", route: "/(tabs)" },
              { key: "homes", label: "Hogares", route: "/(tabs)/homes" },
            ]}
          />

          <DashboardToolbar
            borderColor={theme.border}
            cardColor={theme.card}
            onAddPress={openHomes}
            onCustomizePress={() => router.push("/reports")}
            onInfoPress={() => Alert.alert("Dashboard", "Agrega hogares favoritos para verlos aqui.")}
            textColor={theme.text}
          />

          <EnergySummaryCard
            activeDevices={onlineDevices.length}
            cardColor={theme.card}
            formattedConsumption={formatKwh(currentConsumption)}
            mutedColor={theme.muted}
            rowColor={theme.row}
            textColor={theme.text}
          />

          <View style={styles.widgets}>
            {dashboardHomes.length > 0 ? (
              dashboardHomes.map((home) => {
                const homeDevices = devices.filter((device) => device.homeId === home.id);
                const homeConsumption = homeDevices
                  .filter((device) => device.online)
                  .reduce((sum, device) => sum + device.consumption, 0);

                return (
                  <HomeWidgetCard
                    key={home.id}
                    consumption={`${homeConsumption.toFixed(2)} kWh`}
                    name={home.name}
                    onPress={() => {
                      setActiveHomeId(home.id);
                      openHomes();
                    }}
                    rowAltColor={theme.rowAlt}
                    rowColor={theme.row}
                    textColor={theme.text}
                  />
                );
              })
            ) : (
              <EmptyDashboard
                cardColor={theme.card}
                mutedColor={theme.muted}
                onAddPress={openHomes}
                textColor={theme.text}
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
    backgroundColor: DARK,
  },
  container: {
    alignItems: "center",
    minHeight: "100%",
    paddingBottom: 112,
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  widgets: {
    marginTop: 30,
  },
});
