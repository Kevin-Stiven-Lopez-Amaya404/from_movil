import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { profileFont } from "@/components/profile/profileTheme";
import {
  NotificationTabs,
  type NotificationSection,
} from "@/components/notifications/NotificationTabs";
import { useActiveDeviceAlerts } from "@/lib/alerts/use-active-device-alerts";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import type {
  NotificationStatus,
  SmartNotification,
} from "@/lib/services/notifications-service";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function NotificationsScreen() {
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section?: string }>();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const [filter, setFilter] = useState<NotificationStatus | "ALL">("ALL");
  const [activeSection, setActiveSection] =
    useState<NotificationSection>("alerts");
  const [respondingInvitationId, setRespondingInvitationId] =
    useState<string | null>(null);
  const openingNotificationsRef = useRef<Set<string>>(new Set());
  const {
    devices,
    accessibleHomes,
    notifications: remoteNotifications,
    incomingInvitations,
    unreadNotificationCount,
    acceptInvitation,
    rejectInvitation,
    markNotificationAsRead,
    dismissNotification,
    markAllNotificationsAsRead,
  } = useSmartHome();
  const {
    alerts: activeAlerts,
    count: activeAlertCount,
    isLoading: alertsAreLoading,
    hasError: alertsHaveError,
  } = useActiveDeviceAlerts();

  useFocusEffect(
    useCallback(() => {
      if (
        section === "invitations" ||
        section === "alerts" ||
        section === "history"
      ) {
        setActiveSection(section);
      }
    }, [section]),
  );

  function handleSectionChange(next: NotificationSection) {
    setActiveSection(next);
    router.setParams({ section: next });
  }

  async function respondToInvitation(
    invitationId: string,
    action: "accept" | "reject",
  ) {
    if (respondingInvitationId) return;

    setRespondingInvitationId(invitationId);

    try {
      if (action === "accept") {
        await acceptInvitation(invitationId);

        Alert.alert(
          "InvitaciÃ³n aceptada",
          "El acceso fue aceptado. Si el nuevo hogar " +
            "no aparece, vuelve a iniciar sesiÃ³n " +
            "para actualizar tus hogares.",
        );
      } else {
        await rejectInvitation(invitationId);
      }
    } catch (error) {
      Alert.alert(
        "No se pudo responder",
        error instanceof Error
          ? error.message
          : "Intenta nuevamente.",
      );
    } finally {
      setRespondingInvitationId(null);
    }
  }

  const notifications = remoteNotifications
    .filter((item) => item.status !== "DISMISSED")
    .map((item) => ({
    id: item.id,
    title: item.title ?? item.type ?? "NotificaciÃ³n",
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
    { key: "UNREAD", label: "No leÃ­das" },
    { key: "READ", label: "LeÃ­das" },
  ];

  function openAlert(alert: (typeof activeAlerts)[number]) {
    const homeAvailable = accessibleHomes.some(
      (home) => home.id === alert.homeId,
    );

    if (!homeAvailable) {
      Alert.alert(
        "Hogar no disponible",
        "Ya no tienes acceso al hogar de este dispositivo.",
      );
      return;
    }

    router.push({
      pathname: "/(tabs)/home-detail",
      params: {
        homeId: alert.homeId,
        deviceId: alert.deviceId,
        source: "notifications",
      },
    });
  }

  async function openHistoryNotification(
    notification: SmartNotification,
  ) {
    if (openingNotificationsRef.current.has(notification.id)) return;

    openingNotificationsRef.current.add(notification.id);

    try {
      if (notification.status === "UNREAD") {
        await markNotificationAsRead(notification.id);
      }

      const device = notification.deviceId
        ? devices.find((item) => item.id === notification.deviceId)
        : undefined;

      const targetHomeId = notification.homeId ?? device?.homeId ?? null;
      const targetHome = targetHomeId
        ? accessibleHomes.find((home) => home.id === targetHomeId)
        : undefined;

      if (targetHome) {
        router.push({
          pathname: "/(tabs)/home-detail",
          params: {
            homeId: targetHome.id,
            from: "notifications",
            ...(device?.homeId === targetHome.id
              ? { deviceId: device.id }
              : {}),
          },
        });

        return;
      }

      const message =
        notification.message ??
        notification.description ??
        "No hay mÃ¡s detalles disponibles.";

      Alert.alert(
        notification.title ?? "NotificaciÃ³n",
        targetHomeId
          ? `${message}\n\nEl hogar ya no estÃ¡ disponible o no tienes acceso.`
          : message,
      );
    } catch (error) {
      Alert.alert(
        "No se pudo abrir la notificaciÃ³n",
        error instanceof Error ? error.message : "Intenta nuevamente.",
      );
    } finally {
      openingNotificationsRef.current.delete(notification.id);
    }
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

          <NotificationTabs
            value={activeSection}
            onChange={handleSectionChange}
            invitationCount={incomingInvitations.length}
            alertCount={activeAlertCount}
            unreadCount={unreadNotificationCount}
          />

          {activeSection === "invitations" && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Invitaciones a hogares
              </Text>
              {incomingInvitations.length === 0 ? (
                <Text style={[styles.emptyState, { color: theme.muted }]}>
                  No tienes invitaciones pendientes.
                </Text>
              ) : (
                incomingInvitations.map((invitation) => {
                const responding =
                  respondingInvitationId === invitation.id;
                const disabled = respondingInvitationId !== null;

                return (
                  <View
                    key={invitation.id}
                    style={[
                      styles.activeAlertCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.borderLight,
                      },
                    ]}
                  >
                    <View style={styles.notificationCopy}>
                      <Text
                        style={[
                          styles.notificationTitle,
                          { color: theme.text },
                        ]}
                      >
                        {invitation.homeName ?? "InvitaciÃ³n a un hogar"}
                      </Text>
                      <Text
                        style={[
                          styles.notificationText,
                          { color: theme.muted },
                        ]}
                      >
                        Rol ofrecido: {invitation.role}
                      </Text>
                      <View style={styles.invitationActions}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Aceptar invitaciÃ³n a ${invitation.homeName ?? "un hogar"}`}
                          disabled={disabled}
                          onPress={() =>
                            void respondToInvitation(invitation.id, "accept")
                          }
                          style={[
                            styles.invitationButton,
                            { backgroundColor: theme.blue },
                            disabled && styles.disabledButton,
                          ]}
                        >
                          {responding ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.invitationButtonText}>
                              Aceptar
                            </Text>
                          )}
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Rechazar invitaciÃ³n a ${invitation.homeName ?? "un hogar"}`}
                          disabled={disabled}
                          onPress={() =>
                            void respondToInvitation(invitation.id, "reject")
                          }
                          style={[
                            styles.invitationButton,
                            {
                              backgroundColor: theme.rowAlt,
                              borderColor: theme.borderLight,
                              borderWidth: 1,
                            },
                            disabled && styles.disabledButton,
                          ]}
                        >
                          <Text
                            style={[
                              styles.invitationRejectText,
                              { color: theme.text },
                            ]}
                          >
                            Rechazar
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
                })
              )}
            </View>
          )}

          {activeSection === "alerts" && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Alertas activas
              </Text>
              {alertsAreLoading && (
                <Text
                  style={{
                    color: theme.muted,
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  Consultando el estado de tus dispositivos...
                </Text>
              )}

              {alertsHaveError && (
                <Text
                  style={{
                    color: theme.muted,
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  No se pudo consultar el estado de todos los hogares. Algunas
                  alertas podrían no aparecer.
                </Text>
              )}

              {activeAlerts.length === 0 &&
              !alertsAreLoading &&
              !alertsHaveError ? (
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
                    No tienes alertas activas
                  </Text>
                </View>
              ) : (
                activeAlerts.map((alert) => {
                  const alertColor =
                    alert.tone === "warning" ? "#D97706" : theme.blue;

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
                          style={[
                            styles.notificationTitle,
                            { color: theme.text },
                          ]}
                        >
                          {alert.title}
                        </Text>
                        <Text
                          style={[
                            styles.notificationText,
                            { color: theme.muted },
                          ]}
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
          )}

          {activeSection === "history" && (
            <>
              <View style={styles.historyHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Historial de notificaciones
            </Text>
            {notifications.length > 0 ? (
              <Pressable
                onPress={() => void markAllNotificationsAsRead()}
                style={({ pressed }) => [
                  styles.markAllButton,
                  { borderColor: theme.borderLight },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.markAllText, { color: theme.blue }]}>
                  Marcar todas como leÃ­das
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
                    onPress={() => {
                      const originalNotification = remoteNotifications.find(
                        (notification) => notification.id === item.id,
                      );

                      if (!originalNotification) return;

                      void openHistoryNotification(originalNotification);
                    }}
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
                    accessibilityLabel={`Descartar notificaciÃ³n ${item.title}`}
                  >
                    <Ionicons name="trash-outline" size={15} color={theme.muted} />
                  </Pressable>
                </View>
              ))
            )}
              </View>
            </>
          )}
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
  invitationActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  invitationButton: {
    alignItems: "center",
    borderRadius: 10,
    justifyContent: "center",
    minHeight: 38,
    minWidth: 92,
    paddingHorizontal: 12,
  },
  invitationButtonText: {
    color: "#FFFFFF",
    fontFamily: profileFont,
    fontSize: 12,
    fontWeight: "800",
  },
  invitationRejectText: {
    fontFamily: profileFont,
    fontSize: 12,
    fontWeight: "800",
  },
  disabledButton: { opacity: 0.55 },
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
