import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { profileFont } from "@/components/profile/profileTheme";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import type { NotificationStatus } from "@/lib/services/notifications-service";
import { useAppTheme } from "@/lib/theme/app-theme";
import {
  getConsumptionGoalProgress,
  getHouseConsumption,
} from "@/lib/utils/consumption";
import { formatEnergy } from "@/lib/utils/formatters";

type ActiveAlert = {
  id: string;
  homeId: string;
  deviceId?: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: "critical" | "warning" | "info";
};

export default function NotificationsScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const [filter, setFilter] = useState<NotificationStatus | "ALL">("ALL");
  const {
    devices,
    resolvedSmartAlerts,
    homes,
    accessibleHomes,
    homeConsumptionGoals,
    setActiveHomeId,
    notifications: remoteNotifications,
    markNotificationAsRead,
    dismissNotification,
    markAllNotificationsAsRead,
  } = useSmartHome();

  const notifications = remoteNotifications.map((item) => ({
    id: item.id,
    title: item.title ?? item.type ?? "Notificación",
    description: item.message ?? item.description ?? "",
    time: item.createdAt
      ? new Date(item.createdAt).toLocaleString()
      : "Ahora",
    icon:
      item.type === "ALERT" || item.priority === "alta"
        ? ("alert-circle-outline" as const)
        : ("notifications-outline" as const),
    tone:
      item.priority === "alta" || item.type === "ALERT"
        ? ("danger" as const)
        : item.status === "UNREAD"
          ? ("warning" as const)
          : ("info" as const),
    status: item.status,
  }));

  const visibleNotifications = useMemo(() => {
    if (filter === "ALL") return notifications;
    return notifications.filter((item) => item.status === filter);
  }, [filter, notifications]);

  const toneColor: Record<string, string> = {
    info: theme.blue,
    warning: theme.danger,
    danger: theme.danger,
    success: theme.success,
  };

  const filterOptions: {
    key: NotificationStatus | "ALL";
    label: string;
  }[] = [
    { key: "ALL", label: "Todas" },
    { key: "UNREAD", label: "No leídas" },
    { key: "READ", label: "Leídas" },
  ];

  const accessibleHomeIds = new Set(accessibleHomes.map((home) => home.id));
  const visibleDevices = devices.filter((device) =>
    accessibleHomeIds.has(device.homeId),
  );

  const deviceAlerts: ActiveAlert[] = visibleDevices
    .filter(
      (device) =>
        (device.critical || !device.online) &&
        !resolvedSmartAlerts.includes(device.id),
    )
    .map((device) => {
      const home = homes.find((item) => item.id === device.homeId);

      if (device.critical) {
        return {
          id: `${device.id}-critical`,
          deviceId: device.id,
          homeId: device.homeId,
          title: `${device.name} requiere atención`,
          description: `El dispositivo está marcado como crítico en ${
            home?.name ?? "tu hogar"
          }.`,
          icon: "warning-outline",
          tone: "critical",
        };
      }

      return {
        id: `${device.id}-offline`,
        deviceId: device.id,
        homeId: device.homeId,
        title: `${device.name} está desconectado`,
        description: `No se ha detectado conexión con el dispositivo en ${
          home?.name ?? "tu hogar"
        }.`,
        icon: "cloud-offline-outline",
        tone: "info",
      };
    });

  const homeConsumptionAlerts: ActiveAlert[] = accessibleHomes.flatMap(
    (home) => {
      const targetWh = homeConsumptionGoals[home.id];

      // No generar alertas si el hogar no tiene una meta configurada.
      if (
        targetWh === undefined ||
        !Number.isFinite(targetWh) ||
        targetWh <= 0
      ) {
        return [];
      }

      const consumedWh = getHouseConsumption(devices, home.id);
      const { percentage, status } = getConsumptionGoalProgress(
        consumedWh,
        targetWh,
      );

      if (status === "within") return [];

      return [
        {
          id: `${home.id}-consumption-goal`,
          homeId: home.id,
          title:
            status === "exceeded"
              ? `Meta superada en ${home.name}`
              : `Consumo cercano a la meta en ${home.name}`,
          description: `${formatEnergy(consumedWh)} de ${formatEnergy(
            targetWh,
          )} · ${Math.round(percentage)}%`,
          icon:
            status === "exceeded"
              ? "alert-circle-outline"
              : "warning-outline",
          tone: status === "exceeded" ? "critical" : "warning",
        },
      ];
    },
  );

  const activeAlerts = [...deviceAlerts, ...homeConsumptionAlerts];

  function openAlert(alert: ActiveAlert) {
    setActiveHomeId(alert.homeId);
    router.push({
      pathname: "/(tabs)/home-detail",
      params: {
        homeId: alert.homeId,
        ...(alert.deviceId ? { deviceId: alert.deviceId } : {}),
      },
    });
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
          <View style={styles.header}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: theme.rowAlt,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={theme.blue}
              />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.text }]}>
                Notificaciones
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                Todo lo relevante de la app
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Alertas activas
            </Text>
            {activeAlerts.length === 0 ? (
              <View
                style={[
                  styles.activeAlertEmpty,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                <Text style={[styles.emptyState, { color: theme.muted }]}>
                  No hay alertas activas
                </Text>
              </View>
            ) : (
              activeAlerts.map((alert) => {
                const alertColor =
                  alert.tone === "critical"
                    ? theme.danger
                    : alert.tone === "warning"
                      ? "#D97706"
                      : theme.blue;

                return (
                  <Pressable
                    key={alert.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Revisar ${alert.title}`}
                    onPress={() => openAlert(alert)}
                    style={({ pressed }) => [
                      styles.activeAlertCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.borderLight,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.notificationIcon,
                        { backgroundColor: `${alertColor}1A` },
                      ]}
                    >
                      <Ionicons
                        name={alert.icon}
                        size={20}
                        color={alertColor}
                      />
                    </View>
                    <View style={styles.notificationCopy}>
                      <Text
                        style={[styles.notificationTitle, { color: theme.text }]}
                      >
                        {alert.title}
                      </Text>
                      <Text
                        style={[styles.notificationText, { color: theme.muted }]}
                      >
                        {alert.description}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={19}
                      color={theme.muted}
                    />
                  </Pressable>
                );
              })
            )}
          </View>

          <View style={styles.historyHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Historial de notificaciones
            </Text>
            {remoteNotifications.length > 0 ? (
              <Pressable
                onPress={() => void markAllNotificationsAsRead()}
                style={({ pressed }) => [
                  styles.markAllButton,
                  { borderColor: theme.borderLight },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.markAllText, { color: theme.blue }]}>
                  Marcar todas como leídas
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View style={[styles.filtersRow, { gap: 8 }]}>
            {filterOptions.map((option) => {
              const selected = filter === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setFilter(option.key)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: selected ? theme.rowAlt : theme.card,
                      borderColor: selected ? theme.blue : theme.borderLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: selected ? theme.blue : theme.muted },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            {visibleNotifications.length === 0 ? (
              <Text style={[styles.emptyState, { color: theme.muted }]}>
                No hay notificaciones en este filtro.
              </Text>
            ) : (
              visibleNotifications.map((item) => (
                <View key={item.id} style={styles.notificationRow}>
                  <Pressable
                    onPress={() => void markNotificationAsRead(item.id)}
                    style={({ pressed }) => [
                      styles.notificationContent,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.notificationIcon,
                        { backgroundColor: `${toneColor[item.tone]}1A` },
                      ]}
                    >
                      <Ionicons
                        name={item.icon as keyof typeof Ionicons.glyphMap}
                        size={18}
                        color={toneColor[item.tone]}
                      />
                    </View>
                    <View style={styles.notificationCopy}>
                      <Text
                        style={[styles.notificationTitle, { color: theme.text }]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[styles.notificationText, { color: theme.muted }]}
                      >
                        {item.description}
                      </Text>
                    </View>
                    <Text style={[styles.notificationTime, { color: theme.muted }]}>
                      {item.time}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => void dismissNotification(item.id)}
                    style={({ pressed }) => [
                      styles.dismissButton,
                      { borderColor: theme.borderLight },
                      pressed && styles.pressed,
                    ]}
                    accessibilityLabel={`Descartar notificación ${item.title}`}
                  >
                    <Ionicons name="trash-outline" size={15} color={theme.muted} />
                  </Pressable>
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
  safeArea: { flex: 1 },
  content: { alignSelf: "center", width: "100%" },
  header: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 18,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  headerCopy: { flex: 1, marginLeft: 12 },
  title: {
    fontFamily: profileFont,
    fontSize: 20,
    fontWeight: "900",
  },
  subtitle: {
    fontFamily: profileFont,
    fontSize: 12,
    marginTop: 2,
  },
  section: { marginTop: 24 },
  sectionTitle: {
    fontFamily: profileFont,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  historyHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    paddingVertical: 6,
  },
  activeAlertCard: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    padding: 14,
  },
  activeAlertEmpty: {
    borderRadius: 18,
    borderWidth: 1,
  },
  notificationRow: {
    alignItems: "center",
    borderBottomColor: "rgba(148,163,184,0.25)",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  notificationContent: {
    alignItems: "flex-start",
    flex: 1,
    flexDirection: "row",
  },
  notificationIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  notificationCopy: { flex: 1, marginLeft: 12 },
  dismissButton: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    marginLeft: 10,
    width: 32,
  },
  notificationTitle: {
    fontFamily: profileFont,
    fontSize: 14,
    fontWeight: "800",
  },
  notificationText: {
    fontFamily: profileFont,
    fontSize: 11,
    marginTop: 4,
  },
  notificationTime: {
    fontFamily: profileFont,
    fontSize: 10,
    marginLeft: 8,
    marginTop: 2,
  },
  pressed: { opacity: 0.72 },
  markAllButton: {
    alignSelf: "flex-end",
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  markAllText: {
    fontFamily: profileFont,
    fontSize: 12,
    fontWeight: "800",
  },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: {
    fontFamily: profileFont,
    fontSize: 11,
    fontWeight: "800",
  },
  emptyState: {
    fontFamily: profileFont,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 20,
    textAlign: "center",
  },
});
