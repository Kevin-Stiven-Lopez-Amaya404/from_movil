import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import {
  getConsumptionGoalProgress,
  getHouseConsumption,
} from "@/lib/utils/consumption";
import { formatEnergy } from "@/lib/utils/formatters";

export default function AlertsScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();

  const {
    devices,
    homeConsumptionGoals,
    homes,
    accessibleHomes,
    resolvedSmartAlerts,
    resolveSmartDeviceAlert,
    setActiveHomeId,
  } = useSmartHome();

  /**
   * Generamos una alerta por dispositivo.
   *
   * Prioridad:
   * 1. Dispositivo crítico.
   * 2. Dispositivo desconectado.
   */
  const accessibleHomeIds = new Set(accessibleHomes.map((home) => home.id));
  const visibleDevices = devices.filter((device) => accessibleHomeIds.has(device.homeId));

  const alerts = visibleDevices
    .filter(
      (device) =>
        (device.critical || !device.online) &&
        !resolvedSmartAlerts.includes(device.id),
    )
    .map((device) => {
      const home = homes.find((item) => item.id === device.homeId);

      // Una sola alerta por dispositivo.
      // Si es crítico y está desconectado, prevalece la alerta crítica.
      if (device.critical) {
        return {
          id: `${device.id}-critical`,
          deviceId: device.id,
          title: `${device.name} requiere atención`,
          description: `El dispositivo está marcado como crítico en ${
            home?.name ?? "tu hogar"
          }.`,
          icon: "warning-outline" as const,
          type: "critical" as const,
          homeId: device.homeId,
        };
      }

      return {
        id: `${device.id}-offline`,
        deviceId: device.id,
        title: `${device.name} está desconectado`,
        description: `No se ha detectado conexión con el dispositivo en ${
          home?.name ?? "tu hogar"
        }.`,
        icon: "cloud-offline-outline" as const,
        type: "offline" as const,
        homeId: device.homeId,
      };
    });

  const homeConsumptionAlerts = accessibleHomes.flatMap((home) => {
    const targetWh = homeConsumptionGoals[home.id] ?? 5000;
    const consumedWh = getHouseConsumption(devices, home.id);
    const { percentage, status } = getConsumptionGoalProgress(consumedWh, targetWh);

    if (status === "within") return [];

    return [
      {
        id: `${home.id}-consumption-goal`,
        homeId: home.id,
        icon: (status === "exceeded" ? "alert-circle-outline" : "warning-outline") as keyof typeof Ionicons.glyphMap,
        status,
        title:
          status === "exceeded"
            ? `Meta superada en ${home.name}`
            : `Consumo cercano a la meta en ${home.name}`,
        description: `${formatEnergy(consumedWh)} de ${formatEnergy(targetWh)} · ${Math.round(percentage)}%`,
      },
    ];
  });

  const totalAlertCount = alerts.length + homeConsumptionAlerts.length;

  function goToHome(homeId: string, deviceId: string) {
    setActiveHomeId(homeId);

    router.push({
      pathname: "/(tabs)/homes",
      params: {
        homeId,
        deviceId,
      },
    });
  }

  function goToHomeConsumption(homeId: string) {
    setActiveHomeId(homeId);
    router.push({ pathname: "/(tabs)/homes", params: { homeId } });
  }

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
          {/* ENCABEZADO */}

          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borderLight,
                },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="arrow-back" size={22} color={theme.text} />
            </Pressable>

            <View style={styles.headerCopy}>
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Alertas
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color: theme.muted,
                  },
                ]}
              >
                Revisa el estado de tus dispositivos
              </Text>
            </View>
          </View>

          {/* RESUMEN */}

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.borderLight,
              },
            ]}
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    totalAlertCount > 0 ? theme.dangerSoft : theme.rowAlt,
                },
              ]}
            >
              <Ionicons
                name={
                  totalAlertCount > 0
                    ? "notifications-outline"
                    : "checkmark-circle-outline"
                }
                size={27}
                color={totalAlertCount > 0 ? theme.danger : theme.success}
              />
            </View>

            <View style={styles.summaryCopy}>
              <Text
                style={[
                  styles.summaryTitle,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {totalAlertCount > 0
                  ? `${totalAlertCount} alerta${
                      totalAlertCount === 1 ? "" : "s"
                    } pendiente${totalAlertCount === 1 ? "" : "s"}`
                  : "Todo está en orden"}
              </Text>

              <Text
                style={[
                  styles.summaryDescription,
                  {
                    color: theme.muted,
                  },
                ]}
              >
                {alerts.length > 0
                  ? "Hay dispositivos que requieren tu atención."
                  : "No encontramos problemas en tus dispositivos."}
              </Text>
            </View>
          </View>

          {homeConsumptionAlerts.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Meta de consumo</Text>

              {homeConsumptionAlerts.map((alert) => {
                const color = alert.status === "exceeded" ? theme.danger : "#D97706";

                return (
                  <Pressable
                    key={alert.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver consumo de ${alert.homeId}`}
                    onPress={() => goToHomeConsumption(alert.homeId)}
                    style={({ pressed }) => [
                      styles.goalAlertCard,
                      { backgroundColor: theme.card, borderColor: color },
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={[styles.alertIcon, { backgroundColor: theme.rowAlt }]}>
                      <Ionicons name={alert.icon} size={24} color={color} />
                    </View>
                    <View style={styles.alertCopy}>
                      <Text style={[styles.alertTitle, { color: theme.text }]}>{alert.title}</Text>
                      <Text style={[styles.alertDescription, { color: theme.muted }]}>{alert.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={19} color={color} />
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* LISTADO */}

          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Alertas de dispositivos
            </Text>

            {alerts.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={42}
                  color={theme.success}
                />

                <Text
                  style={[
                    styles.emptyTitle,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  No tienes alertas
                </Text>

                <Text
                  style={[
                    styles.emptyDescription,
                    {
                      color: theme.muted,
                    },
                  ]}
                >
                  Todos tus dispositivos están funcionando correctamente.
                </Text>
              </View>
            ) : (
              alerts.map((alert) => (
                <View
                  key={alert.id}
                  style={[
                    styles.alertCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.borderLight,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.alertIcon,
                      {
                        backgroundColor:
                          alert.type === "critical"
                            ? theme.dangerSoft
                            : theme.rowAlt,
                      },
                    ]}
                  >
                    <Ionicons
                      name={alert.icon}
                      size={24}
                      color={
                        alert.type === "critical" ? theme.danger : theme.blue
                      }
                    />
                  </View>

                  <View style={styles.alertCopy}>
                    <Text
                      style={[styles.alertTitle, { color: theme.text }]}
                      numberOfLines={2}
                    >
                      {alert.title}
                    </Text>

                    <Text
                      style={[styles.alertDescription, { color: theme.muted }]}
                    >
                      {alert.description}
                    </Text>

                    <View style={styles.alertActions}>
                      <Pressable
                        onPress={() => goToHome(alert.homeId, alert.deviceId)}
                        style={({ pressed }) => [
                          styles.homeButton,
                          {
                            backgroundColor: theme.rowAlt,
                            borderColor: theme.borderLight,
                          },
                          pressed && styles.pressed,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Ver hogar de ${alert.title}`}
                      >
                        <Text
                          style={[styles.alertAction, { color: theme.blue }]}
                        >
                          Ver hogar
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={15}
                          color={theme.blue}
                        />
                      </Pressable>

                      <Pressable
                        onPress={() => resolveSmartDeviceAlert(alert.deviceId)}
                        style={({ pressed }) => [
                          styles.resolveButton,
                          {
                            borderColor: theme.borderLight,
                            backgroundColor: theme.rowAlt,
                          },
                          pressed && styles.pressed,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Resolver alerta de ${alert.title}`}
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={16}
                          color={theme.success}
                        />
                        <Text
                          style={[
                            styles.resolveButtonText,
                            { color: theme.success },
                          ]}
                        >
                          Resolver
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))
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

  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },

  backButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  headerCopy: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
  },

  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 3,
  },

  summaryCard: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 22,
    padding: 16,
  },

  summaryIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 50,
    justifyContent: "center",
    width: 50,
  },

  summaryCopy: {
    flex: 1,
    marginLeft: 13,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "900",
  },

  summaryDescription: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
    marginTop: 3,
  },

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 12,
  },

  goalAlertCard: {
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    padding: 13,
  },
  alertCard: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    padding: 14,
  },

  alertIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  alertCopy: {
    flex: 1,
    marginLeft: 12,
  },

  alertTitle: {
    fontSize: 14,
    fontWeight: "900",
  },

  alertDescription: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
    marginTop: 3,
  },

  alertActions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 7,
  },

  alertAction: {
    fontSize: 12,
    fontWeight: "900",
  },

  homeButton: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  resolveButton: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  resolveButtonText: {
    fontSize: 11,
    fontWeight: "900",
  },

  emptyCard: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    padding: 28,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 12,
  },

  emptyDescription: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 5,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.7,
  },
});
