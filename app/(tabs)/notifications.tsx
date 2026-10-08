import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { profileFont } from "@/components/profile/profileTheme";
import { useMockApi } from "@/lib/config/api-config";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import type { NotificationStatus } from "@/lib/services/notifications-service";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function NotificationsScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const [filter, setFilter] = useState<NotificationStatus | "ALL">("ALL");
  const {
    devices,
    resolvedSmartAlerts,
    notifications: remoteNotifications,
    markNotificationAsRead,
    dismissNotification,
    markAllNotificationsAsRead,
  } = useSmartHome();

  const demoNotifications = [
    {
      id: "welcome",
      title: "Bienvenido a Smart Home",
      description: "Tu hogar está listo para gestionar dispositivos y alertas.",
      time: "Hace 1 min",
      icon: "sparkles-outline" as const,
      tone: "info" as const,
      status: "UNREAD" as const,
    },
    ...devices
      .filter(
        (device) =>
          (device.critical || !device.online) &&
          !resolvedSmartAlerts.includes(device.id),
      )
      .map((device) => ({
        id: `device-${device.id}`,
        title: device.critical
          ? `${device.name} requiere atención`
          : `${device.name} está desconectado`,
        description: device.critical
          ? "El dispositivo está marcado como crítico y necesita revisión."
          : "La conexión con el dispositivo se ha perdido.",
        time: "Ahora",
        icon: device.critical
          ? "alert-circle-outline"
          : "cloud-offline-outline",
        tone: device.critical ? "warning" : "danger",
        status: "UNREAD" as const,
      })),
    {
      id: "summary",
      title: "Resumen del día",
      description: "Revisa el consumo y el estado general de tus hogares.",
      time: "Hace 2 h",
      icon: "stats-chart-outline" as const,
      tone: "success" as const,
      status: "READ" as const,
    },
  ];

  const notifications = useMockApi
    ? demoNotifications
    : remoteNotifications.map((item) => ({
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
  }[] = [];

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
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chevron-back" size={17} color={theme.blue} />
            <Text style={[styles.backText, { color: theme.blue }]}>Volver</Text>
          </Pressable>

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
            {!useMockApi && remoteNotifications.length > 0 ? (
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

          {!useMockApi ? (
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
          ) : null}

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
                    onPress={
                      useMockApi
                        ? undefined
                        : () => void markNotificationAsRead(item.id)
                    }
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

                  {!useMockApi ? (
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
                  ) : null}
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
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {
    fontFamily: profileFont,
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 6,
  },
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
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    paddingVertical: 6,
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
