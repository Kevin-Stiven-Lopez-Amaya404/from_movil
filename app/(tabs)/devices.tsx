import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSmartHome } from "@/lib/context/smart-home-context";
import { canControlHome } from "@/lib/domain/home";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { getDeviceControlErrorMessage } from "@/lib/utils/control-error-message";
import { useActiveDeviceAlerts } from "@/lib/alerts/use-active-device-alerts";
import { styles } from "../../styles/(tabs)/devices.styles";

function formatLastSeenAt(lastSeenAt?: string | null) {
  if (!lastSeenAt) return "Sin último reporte";

  const timestamp = new Date(lastSeenAt).getTime();
  if (Number.isNaN(timestamp)) return "Sin último reporte";

  const diffMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));

  if (diffMinutes < 1) return "Último reporte: ahora";
  if (diffMinutes < 60) return `Último reporte: hace ${diffMinutes} min`;

  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `Último reporte: hace ${hours} h`;

  const days = Math.floor(hours / 24);
  return `Último reporte: hace ${days} d`;
}

export default function DevicesScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const [pendingDeviceId, setPendingDeviceId] = useState<string | null>(null);

  const {
    devices,
    homes,
    accessibleHomes,
    deviceLoadStatusByHome,
    homesLoadStatus,
    resolvedSmartAlerts,
    setActiveHomeId,
    toggleDevice,
  } = useSmartHome();

  const accessibleHomeIds = new Set(accessibleHomes.map((home) => home.id));
  const visibleDevices = devices.filter((device) =>
    accessibleHomeIds.has(device.homeId),
  );

  const onlineCount = visibleDevices.filter(
    (device) =>
      device.connectivityStatus === "ONLINE" && device.online,
  ).length;
  const isDeviceListLoading =
    homesLoadStatus === "loading" ||
    accessibleHomes.some(
      (home) =>
        (deviceLoadStatusByHome[home.id] ?? "loading") === "loading",
    );
  const hasDeviceLoadError =
    homesLoadStatus === "error" ||
    accessibleHomes.some(
      (home) => deviceLoadStatusByHome[home.id] === "error",
    );
  const areDeviceListsLoaded =
    homesLoadStatus === "loaded" &&
    accessibleHomes.every(
      (home) => deviceLoadStatusByHome[home.id] === "loaded",
    );

  const { count: alertCount } = useActiveDeviceAlerts();

  function openDeviceHome(homeId: string) {
    setActiveHomeId(homeId);

    router.push({
      pathname: "/(tabs)/home-detail",
      params: { homeId, from: "devices" },
    });
  }

  async function handleToggleDevice(deviceId: string) {
    if (pendingDeviceId) return;

    setPendingDeviceId(deviceId);

    try {
      await toggleDevice(deviceId);
    } catch (error) {
      Alert.alert(
        "No se pudo cambiar el estado",
        getDeviceControlErrorMessage(error),
      );
    } finally {
      setPendingDeviceId(null);
    }
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
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar dispositivos"
              hitSlop={8}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)/(main)/index");
                }
              }}
              style={({ pressed }) => [
                styles.backButton,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borderLight,
                },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="close" size={21} color={theme.text} />
            </Pressable>

            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.text }]}>
                Dispositivos
              </Text>

              <Text style={[styles.subtitle, { color: theme.muted }]}>
                Todos tus dispositivos Smart Home
              </Text>
            </View>
          </View>

          {/* SUMMARY */}
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
                styles.summaryItem,
                {
                  backgroundColor: theme.rowAlt,
                },
              ]}
            >
              <Ionicons
                name="hardware-chip-outline"
                size={23}
                color={theme.blue}
              />

              <Text style={[styles.summaryNumber, { color: theme.text }]}>
                {areDeviceListsLoaded ? visibleDevices.length : "—"}
              </Text>

              <Text style={[styles.summaryLabel, { color: theme.muted }]}>
                Total
              </Text>
            </View>

            <View
              style={[
                styles.summaryItem,
                {
                  backgroundColor: theme.rowAlt,
                },
              ]}
            >
              <Ionicons name="wifi-outline" size={23} color={theme.success} />

              <Text style={[styles.summaryNumber, { color: theme.text }]}>
                {areDeviceListsLoaded ? onlineCount : "—"}
              </Text>

              <Text style={[styles.summaryLabel, { color: theme.muted }]}>
                Conectados
              </Text>
            </View>

            <View
              style={[
                styles.summaryItem,
                {
                  backgroundColor: theme.rowAlt,
                },
              ]}
            >
              <Ionicons name="warning-outline" size={23} color={theme.danger} />

              <Text style={[styles.summaryNumber, { color: theme.text }]}>
                {areDeviceListsLoaded ? alertCount : "—"}
              </Text>

              <Text style={[styles.summaryLabel, { color: theme.muted }]}>
                Alertas
              </Text>
            </View>
          </View>

          {/* DEVICES */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Mis dispositivos
            </Text>

            {isDeviceListLoading ? (
              <View
                style={[
                  styles.statePanel,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                <ActivityIndicator color={theme.blue} />
                <Text style={[styles.statePanelCopy, { color: theme.muted }]}>
                  Cargando dispositivos...
                </Text>
              </View>
            ) : null}

            {hasDeviceLoadError ? (
              <View
                style={[
                  styles.statePanel,
                  {
                    backgroundColor: theme.dangerSoft,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                <Ionicons name="warning-outline" size={21} color={theme.danger} />
                <Text style={[styles.statePanelCopy, { color: theme.text }]}>
                  No se pudieron cargar los dispositivos de todos tus hogares.
                </Text>
              </View>
            ) : null}

            {homesLoadStatus === "loaded" && accessibleHomes.length === 0 ? (
              <View
                style={[
                  styles.statePanel,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                <Ionicons name="home-outline" size={25} color={theme.blue} />
                <Text style={[styles.statePanelTitle, { color: theme.text }]}>
                  Aún no tienes hogares
                </Text>
                <Text style={[styles.statePanelCopy, { color: theme.muted }]}>
                  Agrega o acepta un hogar para ver sus dispositivos.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/(tabs)/(main)/homes")}
                  style={({ pressed }) => [styles.stateAction, pressed && styles.pressed]}
                >
                  <Text style={[styles.stateActionText, { color: theme.blue }]}>
                    Ver mis hogares
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={theme.blue} />
                </Pressable>
              </View>
            ) : null}

            {areDeviceListsLoaded &&
            !hasDeviceLoadError &&
            accessibleHomes.length > 0 &&
            visibleDevices.length === 0 ? (
              <View
                style={[
                  styles.statePanel,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                <Ionicons name="hardware-chip-outline" size={25} color={theme.blue} />
                <Text style={[styles.statePanelTitle, { color: theme.text }]}>
                  Aún no hay dispositivos
                </Text>
                <Text style={[styles.statePanelCopy, { color: theme.muted }]}>
                  Añade un dispositivo a uno de tus hogares para empezar.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/(tabs)/add-device")}
                  style={({ pressed }) => [styles.stateAction, pressed && styles.pressed]}
                >
                  <Text style={[styles.stateActionText, { color: theme.blue }]}>
                    Agregar dispositivo
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={theme.blue} />
                </Pressable>
              </View>
            ) : null}

            {visibleDevices.map((device) => {
              const home = homes.find((item) => item.id === device.homeId);
              const canControlDevice = canControlHome(home?.homeRole);
              const confirmedOnline =
                device.connectivityStatus === "ONLINE" && device.online;
              const confirmedOffline =
                device.connectivityStatus === "OFFLINE";

              const hasAlert =
                (device.critical || confirmedOffline) &&
                !resolvedSmartAlerts.includes(device.id);

              const statusText = hasAlert
                ? device.critical
                  ? "Requiere atención"
                  : "Sin conexión"
                : confirmedOnline
                  ? "Conectado"
                  : confirmedOffline
                    ? "Sin conexión"
                    : "Estado sin confirmar";

              const statusColor = hasAlert
                ? theme.danger
                : confirmedOnline
                  ? theme.success
                  : theme.muted;

              return (
                <View
                  key={device.id}
                  style={[
                    styles.deviceCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: hasAlert ? theme.danger : theme.borderLight,
                    },
                    hasAlert && styles.alertBorder,
                  ]}
                >
                  {/* DEVICE NAVIGATION */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir ${device.name}`}
                    onPress={() => openDeviceHome(device.homeId)}
                    style={({ pressed }) => [
                      styles.deviceContent,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.deviceIcon,
                        {
                          backgroundColor: theme.rowAlt,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={device.icon as never}
                        size={28}
                        color={confirmedOnline ? theme.blue : theme.muted}
                      />
                    </View>

                    <View style={styles.deviceCopy}>
                      <View style={styles.deviceTitleRow}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.deviceTitle,
                            {
                              color: theme.text,
                            },
                          ]}
                        >
                          {device.name}
                        </Text>

                        {hasAlert && (
                          <Ionicons
                            name="warning-outline"
                            size={16}
                            color={theme.danger}
                          />
                        )}
                      </View>

                      <Text
                        numberOfLines={1}
                        style={[
                          styles.deviceMeta,
                          {
                            color: theme.muted,
                          },
                        ]}
                      >
                        {home?.name ?? "Hogar"}
                      </Text>

                      <Text
                        style={[
                          styles.deviceStatus,
                          {
                            color: statusColor,
                          },
                        ]}
                      >
                        {statusText}
                      </Text>
                      <Text style={[styles.deviceLastSeen, { color: theme.muted }]}>
                        {formatLastSeenAt(device.lastSeenAt)}
                      </Text>
                    </View>
                  </Pressable>

                  {/* DEVICE SWITCH */}
                  <Switch
                    value={device.state === "on"}
                    disabled={
                      !confirmedOnline ||
                      !canControlDevice ||
                      pendingDeviceId === device.id
                    }
                    onValueChange={() => {
                      void handleToggleDevice(device.id);
                    }}
                    accessibilityLabel={`Cambiar estado de ${device.name}`}
                    trackColor={{
                      false: theme.border,
                      true: theme.successSoft,
                    }}
                    thumbColor={
                      device.state === "on" ? theme.success : theme.card
                    }
                  />
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
