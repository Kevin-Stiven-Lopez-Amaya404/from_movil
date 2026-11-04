import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { canControlHome } from "@/lib/domain/home";
import {
  getDeviceConnectivityState,
  isDeviceConfirmedOnline,
  type SmartDevice,
} from "@/lib/domain/device";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { getDeviceControlErrorMessage } from "@/lib/utils/control-error-message";
import { getDevicePresentationList } from "@/lib/utils/device-presentation";
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
  const pendingDeviceLock = useRef<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null);

  const {
    devices,
    accessibleHomes,
    deviceLoadStatusByHome,
    homesLoadStatus,
    resolvedSmartAlerts,
    setActiveHomeId,
    toggleDevice,
  } = useSmartHome();

  const accessibleHomesById = useMemo(
    () => new Map(accessibleHomes.map((home) => [home.id, home])),
    [accessibleHomes],
  );
  const resolvedSmartAlertIds = useMemo(
    () => new Set(resolvedSmartAlerts),
    [resolvedSmartAlerts],
  );
  const activeHomeFilter =
    selectedHomeId !== null &&
    accessibleHomesById.has(selectedHomeId)
      ? selectedHomeId
      : null;
  const { accessibleDevices, visibleDevices } = useMemo(
    () =>
      getDevicePresentationList(
        devices,
        accessibleHomes,
        searchQuery,
        activeHomeFilter,
      ),
    [accessibleHomes, activeHomeFilter, devices, searchQuery],
  );

  const onlineCount = accessibleDevices.filter(
    isDeviceConfirmedOnline,
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

  const alertCount = accessibleDevices.filter(
    (device) =>
      (device.critical || getDeviceConnectivityState(device) === "OFFLINE") &&
      !resolvedSmartAlertIds.has(device.id),
  ).length;
  const areFiltersActive =
    searchQuery.trim().length > 0 || activeHomeFilter !== null;
  const resultCountText = areDeviceListsLoaded
    ? areFiltersActive
      ? `${visibleDevices.length} de ${accessibleDevices.length}`
      : `${accessibleDevices.length} dispositivos`
    : `${visibleDevices.length} visibles`;

  function openDeviceHome(homeId: string) {
    setActiveHomeId(homeId);

    router.push({
      pathname: "/(tabs)/home-detail",
      params: { homeId, from: "devices" },
    });
  }

  async function handleToggleDevice(device: SmartDevice) {
    const home = accessibleHomesById.get(device.homeId);
    if (
      !home ||
      !canControlHome(home.homeRole) ||
      !isDeviceConfirmedOnline(device) ||
      pendingDeviceLock.current !== null
    ) {
      return;
    }

    pendingDeviceLock.current = device.id;
    setPendingDeviceId(device.id);

    try {
      await toggleDevice(device.id);
    } catch (error) {
      Alert.alert(
        "No se pudo cambiar el estado",
        getDeviceControlErrorMessage(error),
      );
    } finally {
      pendingDeviceLock.current = null;
      setPendingDeviceId(null);
    }
  }

  const renderEmptyState = () => {
    if (homesLoadStatus !== "loaded" || isDeviceListLoading) return null;

    if (accessibleHomes.length === 0) {
      return (
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
          <Button
            variant="text"
            icon={<Ionicons name="arrow-forward" size={16} color={theme.blue} />}
            label="Ver mis hogares"
            labelSize="helper"
            onPress={() => router.push("/(tabs)/(main)/homes")}
            style={styles.stateAction}
          />
        </View>
      );
    }

    if (accessibleDevices.length === 0 && !hasDeviceLoadError) {
      return (
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
          <Button
            variant="text"
            icon={<Ionicons name="arrow-forward" size={16} color={theme.blue} />}
            label="Agregar dispositivo"
            labelSize="helper"
            onPress={() => router.push("/(tabs)/add-device")}
            style={styles.stateAction}
          />
        </View>
      );
    }

    if (accessibleDevices.length > 0 && areFiltersActive) {
      const partialCopy = hasDeviceLoadError || !areDeviceListsLoaded;

      return (
        <View
          style={[
            styles.statePanel,
            {
              backgroundColor: theme.card,
              borderColor: theme.borderLight,
            },
          ]}
        >
          <Ionicons name="search-outline" size={25} color={theme.muted} />
          <Text style={[styles.statePanelTitle, { color: theme.text }]}>
            Sin resultados
          </Text>
          <Text style={[styles.statePanelCopy, { color: theme.muted }]}>
            {partialCopy
              ? "No hay coincidencias entre los dispositivos cargados hasta ahora."
              : "No encontramos dispositivos con esos criterios."}
          </Text>
          <Button
            variant="text"
            label="Limpiar búsqueda y filtros"
            labelSize="helper"
            onPress={() => {
              setSearchQuery("");
              setSelectedHomeId(null);
            }}
            style={styles.stateAction}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <FlatList
        data={visibleDevices}
        keyExtractor={(device) => device.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          {
            paddingHorizontal: layout.gutter,
            paddingTop: layout.screenTop,
            paddingBottom: layout.screenBottom,
          },
        ]}
        ListHeaderComponent={
          <View
            style={[
              styles.content,
              {
                maxWidth: layout.contentWidth,
              },
            ]}
          >
            <View style={styles.header}>
              <ScreenHeader
                accessibilityLabel="Cerrar dispositivos"
                backBackgroundColor={theme.card}
                fallbackHref="/(tabs)/(main)/index"
                subtitle="Consulta y controla tus equipos"
                title="Dispositivos"
                titleSize="title"
              />
            </View>

            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <View style={[styles.summaryItem, { backgroundColor: theme.rowAlt }]}>
                <Ionicons
                  name="hardware-chip-outline"
                  size={22}
                  color={theme.blue}
                  accessible={false}
                />
                <Text
                  accessibilityLabel={
                    areDeviceListsLoaded
                      ? `${accessibleDevices.length} dispositivos en total`
                      : "Total de dispositivos aún no disponible"
                  }
                  style={[styles.summaryNumber, { color: theme.text }]}
                >
                  {areDeviceListsLoaded ? accessibleDevices.length : "—"}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.muted }]}>
                  Total
                </Text>
              </View>

              <View style={[styles.summaryItem, { backgroundColor: theme.rowAlt }]}>
                <Ionicons
                  name="wifi-outline"
                  size={22}
                  color={theme.success}
                  accessible={false}
                />
                <Text
                  accessibilityLabel={
                    areDeviceListsLoaded
                      ? `${onlineCount} dispositivos conectados`
                      : "Dispositivos conectados aún no disponible"
                  }
                  style={[styles.summaryNumber, { color: theme.text }]}
                >
                  {areDeviceListsLoaded ? onlineCount : "—"}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.muted }]}>
                  Conectados
                </Text>
              </View>

              <View style={[styles.summaryItem, { backgroundColor: theme.rowAlt }]}>
                <Ionicons
                  name="warning-outline"
                  size={22}
                  color={theme.danger}
                  accessible={false}
                />
                <Text
                  accessibilityLabel={
                    areDeviceListsLoaded
                      ? `${alertCount} alertas activas`
                      : "Total de alertas aún no disponible"
                  }
                  style={[styles.summaryNumber, { color: theme.text }]}
                >
                  {areDeviceListsLoaded ? alertCount : "—"}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.muted }]}>
                  Alertas
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeading}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Mis dispositivos
                </Text>
                <Text
                  accessibilityLiveRegion="polite"
                  style={[styles.resultCount, { color: theme.muted }]}
                >
                  {resultCountText}
                </Text>
              </View>

              {accessibleDevices.length > 0 ? (
                <View
                  style={[
                    styles.searchBox,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.borderLight,
                    },
                  ]}
                >
                  <Ionicons
                    name="search-outline"
                    size={19}
                    color={theme.muted}
                    accessible={false}
                  />
                  <TextInput
                    accessibilityLabel="Buscar dispositivos"
                    accessibilityHint="Filtra por el nombre del dispositivo o del hogar."
                    autoCapitalize="none"
                    clearButtonMode="never"
                    onChangeText={setSearchQuery}
                    placeholder="Buscar dispositivo u hogar"
                    placeholderTextColor={theme.muted}
                    returnKeyType="search"
                    style={[styles.searchInput, { color: theme.text }]}
                    value={searchQuery}
                  />
                  {searchQuery.length > 0 ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Limpiar búsqueda"
                      hitSlop={4}
                      onPress={() => setSearchQuery("")}
                      style={styles.clearSearchButton}
                    >
                      <Ionicons name="close-circle" size={20} color={theme.muted} />
                    </Pressable>
                  ) : null}
                </View>
              ) : null}

              {accessibleHomes.length > 1 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.homeFilters}
                  accessibilityLabel="Filtrar dispositivos por hogar"
                >
                  {[
                    { id: null, name: "Todos" },
                    ...accessibleHomes.map((home) => ({
                      id: home.id,
                      name: home.name,
                    })),
                  ].map((home) => {
                    const selected = activeHomeFilter === home.id;

                    return (
                      <Pressable
                        key={home.id ?? "all-homes"}
                        accessibilityRole="button"
                        accessibilityLabel={`Filtrar por ${home.name}`}
                        accessibilityState={{ selected }}
                        onPress={() => setSelectedHomeId(home.id)}
                        style={({ pressed }) => [
                          styles.homeFilter,
                          {
                            backgroundColor: selected
                              ? theme.tab.activeBackground
                              : theme.card,
                            borderColor: selected
                              ? theme.tab.activeBorder
                              : theme.borderLight,
                          },
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          numberOfLines={2}
                          style={[
                            styles.homeFilterText,
                            {
                              color: selected
                                ? theme.tab.activeText
                                : theme.muted,
                            },
                          ]}
                        >
                          {home.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              ) : null}

              {isDeviceListLoading ? (
                <View
                  accessibilityLiveRegion="polite"
                  style={[
                    styles.statePanel,
                    styles.inlineStatePanel,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.borderLight,
                    },
                  ]}
                >
                  <ActivityIndicator color={theme.blue} />
                  <Text
                    style={[
                      styles.statePanelCopy,
                      styles.inlineStateCopy,
                      { color: theme.muted },
                    ]}
                  >
                    Cargando dispositivos...
                  </Text>
                </View>
              ) : null}

              {hasDeviceLoadError ? (
                <View
                  accessibilityLiveRegion="polite"
                  style={[
                    styles.statePanel,
                    styles.inlineStatePanel,
                    {
                      backgroundColor: theme.dangerSoft,
                      borderColor: theme.borderLight,
                    },
                  ]}
                >
                  <Ionicons name="warning-outline" size={21} color={theme.danger} />
                  <Text
                    style={[
                      styles.statePanelCopy,
                      styles.inlineStateCopy,
                      { color: theme.text },
                    ]}
                  >
                    No se pudieron cargar todos los hogares. Se muestran los datos disponibles.
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View
            style={[
              styles.content,
              {
                maxWidth: layout.contentWidth,
              },
            ]}
          >
            {renderEmptyState()}
          </View>
        }
        renderItem={({ item: device }) => {
          const home = accessibleHomesById.get(device.homeId);
          const canControlDevice = canControlHome(home?.homeRole);
          const confirmedOnline = isDeviceConfirmedOnline(device);
          const connectivityState = getDeviceConnectivityState(device);
          const confirmedOffline = connectivityState === "OFFLINE";
          const isRelayOn = device.state === "on";
          const isPending = pendingDeviceId === device.id;
          const hasAlert =
            (device.critical || confirmedOffline) &&
            !resolvedSmartAlertIds.has(device.id);
          const connectionLabel = confirmedOnline
            ? "Conectado"
            : confirmedOffline
              ? "Sin conexión"
              : "Estado desconocido";
          const connectionIcon = confirmedOnline
            ? "checkmark-circle-outline"
            : confirmedOffline
              ? "cloud-offline-outline"
              : "help-circle-outline";
          const connectionColor = confirmedOnline
            ? theme.success
            : confirmedOffline
              ? theme.warning
              : theme.muted;
          const relayLabel = confirmedOnline
            ? `Relé ${isRelayOn ? "encendido" : "apagado"}`
            : `Último estado del relé: ${isRelayOn ? "encendido" : "apagado"}`;
          const switchDisabled =
            !confirmedOnline || !canControlDevice || pendingDeviceId !== null;
          const switchHint = pendingDeviceId !== null
            ? "Espera a que termine la actualización del dispositivo."
            : !confirmedOnline
              ? "El dispositivo no tiene conexión confirmada."
              : !canControlDevice
                ? "Tu rol en este hogar no permite controlar el dispositivo."
                : "Cambia el estado del relé.";

          return (
            <View
              style={[
                styles.deviceCard,
                {
                  backgroundColor: theme.card,
                  borderColor: hasAlert ? theme.danger : theme.borderLight,
                },
                hasAlert && styles.alertBorder,
                { maxWidth: layout.contentWidth },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Abrir ${device.name}, hogar ${home?.name ?? "sin nombre"}, ${connectionLabel}, ${relayLabel}`}
                accessibilityHint="Abre el detalle de este hogar."
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
                    size={27}
                    color={confirmedOnline ? theme.blue : theme.muted}
                    accessible={false}
                  />
                </View>

                <View style={styles.deviceCopy}>
                  <Text
                    style={[styles.deviceTitle, { color: theme.text }]}
                  >
                    {device.name}
                  </Text>

                  {hasAlert ? (
                    <View style={styles.alertLabel}>
                      <Ionicons
                        name="warning-outline"
                        size={14}
                        color={theme.danger}
                        accessible={false}
                      />
                      <Text style={[styles.alertText, { color: theme.danger }]}>
                        {device.critical ? "Requiere atención" : "Alerta de conexión"}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.homeLabel}>
                    <Ionicons
                      name="home-outline"
                      size={14}
                      color={theme.muted}
                      accessible={false}
                    />
                    <Text
                      style={[styles.deviceMeta, { color: theme.muted }]}
                    >
                      {home?.name ?? "Hogar"}
                    </Text>
                  </View>

                  <View style={styles.connectionLabel}>
                    <Ionicons
                      name={connectionIcon}
                      size={15}
                      color={connectionColor}
                      accessible={false}
                    />
                    <Text
                      style={[styles.deviceStatus, { color: connectionColor }]}
                    >
                      {connectionLabel}
                    </Text>
                  </View>

                  <Text
                    style={[styles.relayState, { color: theme.textSecondary }]}
                  >
                    {relayLabel}
                  </Text>
                  <Text style={[styles.deviceLastSeen, { color: theme.muted }]}>
                    {formatLastSeenAt(device.lastSeenAt)}
                  </Text>
                </View>
              </Pressable>

              <View style={styles.switchContainer}>
                {isPending ? (
                  <ActivityIndicator
                    accessibilityLabel="Actualizando estado"
                    color={theme.blue}
                    size="small"
                  />
                ) : null}
                <Switch
                  value={isRelayOn}
                  disabled={switchDisabled}
                  onValueChange={() => {
                    void handleToggleDevice(device);
                  }}
                  accessibilityRole="switch"
                  accessibilityLabel={`Relé de ${device.name}`}
                  accessibilityHint={switchHint}
                  accessibilityState={{
                    checked: isRelayOn,
                    disabled: switchDisabled,
                    busy: isPending,
                  }}
                  trackColor={{
                    false: theme.switchTrackInactive,
                    true: theme.switchTrackActive,
                  }}
                  thumbColor={
                    confirmedOnline && isRelayOn
                      ? theme.onPrimary
                      : theme.surfaceSecondary
                  }
                />
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
